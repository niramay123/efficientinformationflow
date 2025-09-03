const userSockets = {}; // { userId: [socketId1, socketId2] }

export const addSocket = (userId, socketId) =>{
    if(!userSockets[userId]) userSockets[userId] = [];
    
    userSockets[userId].push(socketId);
};

export const removeSocket = (userId,socketId)=>{
    if(userSockets[userId])
    {
        userSockets[userId] = userSockets[userId].filter(id=>id!==socketId);
        if(userSockets[userId].length === 0) delete userSockets[userId];
    }
};

export const emitToUser = (userId,event,data)=>{
    if(userSockets[userId] && global.io)
    {
        userSockets[userId].forEach(socketId => {
            global.io.to(socketId).emit(event,data);
        });
    }
}