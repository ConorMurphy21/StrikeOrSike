jQuery(document).ready(function($) {
    // connect to socket io
    const socket = io({
        query: {
            name: USERNAME,
            roomName: ROOMNAME
        }
    });
});