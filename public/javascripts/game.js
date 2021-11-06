jQuery(document).ready(function($) {
    const socket = io({
        query: {
            name: USERNAME,
            roomName: ROOMNAME
        }
    });
});