'use strict';

module.exports = function (io) {
    const kafka = new (require('../services/KafkaService-schedule'))('schedule');
    //var DB = require('../models/scheduler-model')

    io.sockets.on('connection', function (socket) {
        //socket.on('toServer', function (message) {
        //    kafka.send(JSON.stringify(message));
        //});
        //
        //kafka.consumer.on('message', function (message) {
        //
        //});

        //Load initial data to client Store
        socket.on('client-doInitialLoad', function (data) {
            socket.emit('server-doInitialLoad', { data: DB.getEventsData() });
        });

        //Update records in DB and inform other clients about the change
        socket.on('client-doUpdate', function (data) {
            var record = data.record;

            DB.update(record);

            socket.broadcast.emit('server-doUpdate', data);
        });

        //Add record to DB and inform other clients about the change
        socket.on('client-doAdd', function (data) {
            var records = data.records;

            DB.add(records);

            socket.broadcast.emit('server-doAdd', { records: records });

            //Sync ID of new record with client Store
            socket.emit('server-syncId', { records: records });
        });

        //Remove record from DB and inform other clients about the change
        socket.on('client-doRemove', function (data) {
            var ids = data.ids;

            DB.remove(ids);

            socket.broadcast.emit('server-doRemove', { data: data.ids });
        });
    })
}