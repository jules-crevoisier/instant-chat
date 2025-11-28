const mediasoup = require('mediasoup');
const { v4: uuidv4 } = require('uuid');

// Mediasoup configuration for high quality, low latency
const mediasoupConfig = {
    numWorkers: 2, // Use 2 workers for better performance
    worker: {
        logLevel: 'warn',
        logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp'],
        rtcMinPort: 40000,
        rtcMaxPort: 49999,
    },
    router: {
        mediaCodecs: [
            {
                kind: 'audio',
                mimeType: 'audio/opus',
                clockRate: 48000,
                channels: 2,
                parameters: {
                    useinbandfec: 1,
                    minptime: 10,
                    maxplaybackrate: 48000,
                },
            },
        ],
    },
    webRtcTransport: {
        listenIps: [
            {
                ip: '127.0.0.1', // Change to your server IP in production
                announcedIp: null, // Set to your public IP in production
            },
        ],
        initialAvailableOutgoingBitrate: 1000000,
        minimumAvailableOutgoingBitrate: 600000,
        maxIncomingBitrate: 1500000,
    },
};

// Store for workers, routers, and rooms
let mediasoupWorkers = [];
let voiceRooms = new Map(); // roomId -> { router, transports, producers, consumers }

// Initialize Mediasoup workers
async function initializeMediasoup() {
    console.log('Initializing Mediasoup workers...');
    
    for (let i = 0; i < mediasoupConfig.numWorkers; i++) {
        const worker = await mediasoup.createWorker({
            logLevel: mediasoupConfig.worker.logLevel,
            logTags: mediasoupConfig.worker.logTags,
            rtcMinPort: mediasoupConfig.worker.rtcMinPort,
            rtcMaxPort: mediasoupConfig.worker.rtcMaxPort,
        });
        
        worker.on('died', () => {
            console.error('Mediasoup worker died, exiting in 2 seconds...');
            setTimeout(() => process.exit(1), 2000);
        });
        
        mediasoupWorkers.push(worker);
    }
    
    console.log(`Created ${mediasoupWorkers.length} Mediasoup workers`);
}

// Get next worker (round-robin)
function getNextWorker() {
    return mediasoupWorkers[Math.floor(Math.random() * mediasoupWorkers.length)];
}

// Create or get voice room
async function getOrCreateVoiceRoom(roomId) {
    if (voiceRooms.has(roomId)) {
        return voiceRooms.get(roomId);
    }
    
    const worker = getNextWorker();
    const router = await worker.createRouter({
        mediaCodecs: mediasoupConfig.router.mediaCodecs,
    });
    
    const room = {
        id: roomId,
        router,
        transports: new Map(),
        producers: new Map(),
        consumers: new Map(),
        participants: new Map(), // userId -> { transport, producer, consumers }
    };
    
    voiceRooms.set(roomId, room);
    console.log(`Created voice room: ${roomId}`);
    
    return room;
}

// Create WebRTC transport
async function createTransport(room, userId) {
    const transport = await room.router.createWebRtcTransport({
        listenIps: mediasoupConfig.webRtcTransport.listenIps,
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
        initialAvailableOutgoingBitrate: mediasoupConfig.webRtcTransport.initialAvailableOutgoingBitrate,
    });
    
    // Set max incoming bitrate for quality
    await transport.setMaxIncomingBitrate(mediasoupConfig.webRtcTransport.maxIncomingBitrate);
    
    const transportData = {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
        sctpParameters: transport.sctpParameters,
    };
    
    room.transports.set(transport.id, transport);
    
    // Handle transport events
    transport.on('dtlsstatechange', (dtlsState) => {
        if (dtlsState === 'closed') {
            transport.close();
        }
    });
    
    transport.on('close', () => {
        room.transports.delete(transport.id);
        const participant = room.participants.get(userId);
        if (participant && participant.transport === transport) {
            room.participants.delete(userId);
        }
    });
    
    return { transport, transportData };
}

// Connect transport
async function connectTransport(room, transportId, dtlsParameters) {
    const transport = room.transports.get(transportId);
    if (!transport) {
        throw new Error('Transport not found');
    }
    
    await transport.connect({ dtlsParameters });
}

// Create audio producer
async function createProducer(room, transportId, rtpParameters, userId) {
    const transport = room.transports.get(transportId);
    if (!transport) {
        throw new Error('Transport not found');
    }
    
    const producer = await transport.produce({
        kind: 'audio',
        rtpParameters,
        appData: { userId },
    });
    
    room.producers.set(producer.id, producer);
    
    // Store producer in participant
    let participant = room.participants.get(userId);
    if (!participant) {
        participant = { userId };
        room.participants.set(userId, participant);
    }
    participant.producer = producer;
    
    // Create consumers for all other participants
    const newConsumers = [];
    for (const [otherUserId, otherParticipant] of room.participants.entries()) {
        if (otherUserId !== userId && otherParticipant.transport) {
            const consumer = await otherParticipant.transport.consume({
                producerId: producer.id,
                rtcProducerOptions: {
                    codecs: [
                        {
                            mimeType: 'audio/opus',
                            clockRate: 48000,
                            channels: 2,
                            parameters: {
                                useinbandfec: 1,
                                minptime: 10,
                            },
                        },
                    ],
                },
            });
            
            room.consumers.set(consumer.id, consumer);
            
            if (!otherParticipant.consumers) {
                otherParticipant.consumers = new Map();
            }
            otherParticipant.consumers.set(consumer.id, consumer);
            
            newConsumers.push({
                id: consumer.id,
                producerId: producer.id,
                kind: consumer.kind,
                rtpParameters: consumer.rtpParameters,
                appData: consumer.appData,
            });
        }
    }
    
    producer.on('close', () => {
        room.producers.delete(producer.id);
        const participant = room.participants.get(userId);
        if (participant) {
            participant.producer = null;
        }
    });
    
    return {
        id: producer.id,
        kind: producer.kind,
        rtpParameters: producer.rtpParameters,
        newConsumers,
    };
}

// Create consumer for new participant
async function createConsumersForParticipant(room, transportId, userId) {
    const transport = room.transports.get(transportId);
    if (!transport) {
        throw new Error('Transport not found');
    }
    
    const consumers = [];
    
    for (const [producerId, producer] of room.producers.entries()) {
        if (producer.appData.userId !== userId) {
            const consumer = await transport.consume({
                producerId: producer.id,
                rtcProducerOptions: {
                    codecs: [
                        {
                            mimeType: 'audio/opus',
                            clockRate: 48000,
                            channels: 2,
                            parameters: {
                                useinbandfec: 1,
                                minptime: 10,
                            },
                        },
                    ],
                },
            });
            
            room.consumers.set(consumer.id, consumer);
            
            let participant = room.participants.get(userId);
            if (!participant) {
                participant = { userId };
                room.participants.set(userId, participant);
            }
            if (!participant.consumers) {
                participant.consumers = new Map();
            }
            participant.consumers.set(consumer.id, consumer);
            
            consumers.push({
                id: consumer.id,
                producerId: producer.id,
                kind: consumer.kind,
                rtpParameters: consumer.rtpParameters,
                appData: consumer.appData,
            });
        }
    }
    
    return consumers;
}

// Close producer
async function closeProducer(room, producerId, userId) {
    const producer = room.producers.get(producerId);
    if (producer) {
        producer.close();
    }
    
    // Close related consumers
    for (const [consumerId, consumer] of room.consumers.entries()) {
        if (consumer.producerId === producerId) {
            consumer.close();
            room.consumers.delete(consumerId);
            
            // Remove from participant consumers
            for (const participant of room.participants.values()) {
                if (participant.consumers) {
                    participant.consumers.delete(consumerId);
                }
            }
        }
    }
}

// Close transport and clean up participant
async function closeTransport(room, transportId, userId) {
    const transport = room.transports.get(transportId);
    if (transport) {
        transport.close();
    }
    
    const participant = room.participants.get(userId);
    if (participant) {
        if (participant.producer) {
            await closeProducer(room, participant.producer.id, userId);
        }
        if (participant.consumers) {
            for (const consumer of participant.consumers.values()) {
                consumer.close();
                room.consumers.delete(consumer.id);
            }
        }
        room.participants.delete(userId);
    }
    
    // If room is empty, close it
    if (room.participants.size === 0) {
        room.router.close();
        voiceRooms.delete(room.id);
        console.log(`Closed empty voice room: ${room.id}`);
    }
}

// Get room participants
function getRoomParticipants(roomId) {
    const room = voiceRooms.get(roomId);
    if (!room) {
        return [];
    }
    
    return Array.from(room.participants.keys());
}

// Get router RTP capabilities
function getRouterRtpCapabilities(room) {
    return room.router.rtpCapabilities;
}

module.exports = {
    initializeMediasoup,
    getOrCreateVoiceRoom,
    createTransport,
    connectTransport,
    createProducer,
    createConsumersForParticipant,
    closeProducer,
    closeTransport,
    getRoomParticipants,
    getRouterRtpCapabilities,
};


