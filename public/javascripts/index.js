$(document).ready(function () {
    $("#creategame").hide().attr("formnovalidate");
    var roomName = null;
    var metas = document.getElementsByTagName('meta');
    var i, l = metas.length, lang;
    for (i = 0; i < l; ++i) {
        if (metas[i].getAttribute('name') == 'room') {
            roomName = metas[i].getAttribute('content');
        }
    }
    if (roomName) {
        $('#room-name-join').val(roomName);
        $('#name-join').focus();
    }
    let vh = $(window).height() * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    $(window).on('resize', function () {
        let vh = $(window).height() * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    });
});
$(document).ready(function () {
    change_title_font();
    $(window).on('resize', function () {
        change_title_font();
    });
});
$(document).ready(function () {
    $("#creategameBtn").click(function () {
        if ($("#joingameBtn").hasClass("active")) {
            $("#formContent").animate({height: $("#formContent").height() + $("#creategame").height() - $("#joingame").height()}, 400);
            $("#joingame").hide().attr("formnovalidate");
            $("#creategame").show();
            $("#joingameBtn").addClass("inactive underlineHover");
            $("#joingameBtn").removeClass("active");
            $("#creategameBtn").removeClass("inactive underlineHover");
            $("#creategameBtn").addClass("active");
        }
    });
    $("#joingameBtn").click(function () {
        if ($("#creategameBtn").hasClass("active")) {
            $("#formContent").animate({height: $("#formContent").height() + $("#joingame").height() - $("#creategame").height()}, 400);
            $("#joingame").show();
            $("#creategame").hide().attr("formnovalidate");
            $("#joingameBtn").removeClass("inactive underlineHover");
            $("#joingameBtn").addClass("active");
            $("#creategameBtn").addClass("inactive underlineHover");
            $("#creategameBtn").removeClass("active");
        }
    });
    $("#room-name-join").focus(function () {
        $("#room-name-join").removeClass("error");
    });
    $("#name-join").focus(function () {
        $("#name-join").removeClass("error");
    });
    $("#name-create").focus(function () {
        $("#name-create").removeClass("error");
    });
    $("#room-name-create").focus(function () {
        $("#room-name-create").removeClass("error");
    });
});
document.addEventListener('DOMContentLoaded', function () {
    document.forms["joingame"].addEventListener('submit', checkGame);
    // $("#error-holder").html("<span style='color: black;'>Thank you to everyone who has played Codewords, provided feedback, or made a donation! As we transition from college to the next chapter of our lives, we are no longer able to maintain and update Codewords. <span style='color: red'>We would like to transfer ownership of the Codewords source code and the high-traffic codewordsgame.com domain in August.</span> If you are interested in purchasing Codewords and the domain, please email us at <a href='mailto: bjaladi@seas.upenn.edu' class='rules-text'>bjaladi@seas.upenn.edu</a>.</span></br></br><span style='color:#000080; word-wrap: break-word;'>Sarath Jaladi, the brother of one of Codewords' creators, Bharath, recently designed VOID, a minimalist metal wallet. Please consider supporting or sharing his Kickstarter campaign: <a target='_blank' href='https://www.kickstarter.com/projects/voidwallet/void-minimalist-metal-wallet' class='rules-text'>https://www.kickstarter.com/projects/voidwallet/void-minimalist-metal-wallet</a>.</span>");
});
var checkGame = function (e) {
    e.preventDefault();
    valid = true;
    var letters = /^[0-9a-zA-Z]+$/;
    if (e.target.name_join.value === '' || !e.target.name_join.value.match(letters)) {
        $('#error-nj').addClass("animated shake");
        $("#name-join").addClass("error");
        $('#error-nj').one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
            function (e) {
                $('#error-nj').removeClass('animated shake');
            });
        valid = false;
        if (e.target.name_join.value === '' && e.target.room_name_join.value !== '' && e.target.room_name_join.value.match(letters)) {
            $("#error-holder").html("name cannot be blank");
        } else if (!e.target.name_join.value.match(letters) && e.target.room_name_join.value !== '' && e.target.room_name_join.value.match(letters)) {
            $("#error-holder").html("name must be alphanumeric and not contain spaces");
        }
    }
    if (e.target.room_name_join.value === '' || !e.target.room_name_join.value.match(letters)) {
        $('#error-rnj').addClass("animated shake");
        $("#room-name-join").addClass("error");
        $('#error-rnj').one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
            function (e) {
                $('#error-rnj').removeClass('animated shake');
            });
        valid = false;
        if (e.target.room_name_join.value === '') {
            if (e.target.name_join.value === '') {
                $("#error-holder").html("name and room name cannot be blank");
            } else if (!e.target.name_join.value.match(letters)) {
                $("#error-holder").html("name must be alphanumeric and not contain spaces and room name cannot be blank");
            } else {
                $("#error-holder").html("room name cannot be blank");
            }
        } else {
            if (e.target.name_join.value === '') {
                $("#error-holder").html("name cannot be blank and room name must be alphanumeric and not contain spaces<br>please check that you have the correct room name if you are joining a game or create a new game");
            } else if (!e.target.name_join.value.match(letters)) {
                $("#error-holder").html("name and room name must be alphanumeric and not contain spaces<br>please check that you have the correct room name if you are joining a game or create a new game");
            } else {
                $("#error-holder").html("room name must be alphanumeric and not contain spaces<br>please check that you have the correct room name if you are joining a game or create a new game");
            }
        }
    }
    if (valid) {
        $.post('/join_game', {
            name: e.target.name_join.value,
            roomName: e.target.room_name_join.value.toLowerCase()
        }, function (data) {
            if (data.success) {
                window.location.href = "/" + e.target.room_name_join.value.toLowerCase();
            } else {
                if (data.message === 'you have already joined this game') {
                    $('#error-nj').addClass("animated shake");
                    $("#name-join").addClass("error");
                    $('#error-nj').one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
                        function (e) {
                            $('#error-nj').removeClass('animated shake');
                        });
                    $("#error-holder").html("you have already joined this game as " + data.oldName + "<br>please navigate to <a href='/" + data.roomName.toLowerCase() + "'>www.codewordsgame.com/" + data.roomName.toLowerCase() + "</a> to resume your game or leave the room");
                } else if (data.message === 'player name already in use') {
                    $('#error-nj').addClass("animated shake");
                    $("#name-join").addClass("error");
                    $('#error-nj').one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
                        function (e) {
                            $('#error-nj').removeClass('animated shake');
                        });
                    $("#error-holder").html("name is already taken");
                } else if (data.message == 'room name does not exist') {
                    $('#error-rnj').addClass("animated shake");
                    $("#room-name-join").addClass("error");
                    $('#error-rnj').one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
                        function (e) {
                            $('#error-rnj').removeClass('animated shake');
                        });
                    $("#error-holder").html("room does not exist<br>please check that you have the correct room name if you are joining a game or create a new game");
                } else {
                    $('#error-nj').addClass("animated shake");
                    $("#name-join").addClass("error");
                    $('#error-nj').one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
                        function (e) {
                            $('#error-nj').removeClass('animated shake');
                        });
                    $('#error-rnj').addClass("animated shake");
                    $("#room-name-join").addClass("error");
                    $('#error-rnj').one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
                        function (e) {
                            $('#error-rnj').removeClass('animated shake');
                        });
                }
            }
        });
    }
};
document.addEventListener('DOMContentLoaded', function () {
    document.forms["creategame"].addEventListener('submit', createGame);
});
var createGame = function (e) {
    e.preventDefault();
    valid = true;
    var letters = /^[0-9a-zA-Z]+$/;
    if (e.target.name_create.value === '' || !e.target.name_create.value.match(letters)) {
        $('#error-nc').addClass("animated shake");
        $("#name-create").addClass("error");
        $('#error-nc').one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
            function (e) {
                $('#error-nc').removeClass('animated shake');
            });
        valid = false;
        if (e.target.name_create.value === '' && e.target.room_name_create.value !== '' && e.target.room_name_create.value.match(letters)) {
            $("#error-holder").html("name cannot be blank");
        } else if (!e.target.name_create.value.match(letters) && e.target.room_name_create.value !== '' && e.target.room_name_create.value.match(letters)) {
            $("#error-holder").html("name must be alphanumeric and not contain spaces");
        }
    }
    if (e.target.room_name_create.value === '' || !e.target.room_name_create.value.match(letters)) {
        if (e.target.room_name_create.value === '') {
            if (e.target.name_create.value === '') {
                $("#error-holder").html("name and room name cannot be blank");
            } else if (!e.target.name_create.value.match(letters)) {
                $("#error-holder").html("name must be alphanumeric and not contain spaces and room name cannot be blank");
            } else {
                $("#error-holder").html("room name cannot be blank");
            }
        } else {
            if (e.target.name_create.value === '') {
                $("#error-holder").html("name cannot be blank and room name must be alphanumeric and not contain spaces");
            } else if (!e.target.name_create.value.match(letters)) {
                $("#error-holder").html("name and room name must be alphanumeric and not contain spaces");
            } else {
                $("#error-holder").html("room name must be alphanumeric and not contain spaces");
            }
        }
        $('#error-rnc').addClass("animated shake");
        $("#room-name-create").addClass("error");
        $('#error-rnc').one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
            function (e) {
                $('#error-rnc').removeClass('animated shake');
            });
        valid = false;
    }
    if (valid) {
        $.post('/create_game', {
            name: e.target.name_create.value,
            roomName: e.target.room_name_create.value.toLowerCase()
        }, function (data) {
            if (data.success) {
                window.location.href = "/" + e.target.room_name_create.value.toLowerCase();
            } else {
                if (data.message === 'room name already in use') {
                    $('#error-rnc').addClass("animated shake");
                    $("#room-name-create").addClass("error");
                    $('#error-rnc').one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
                        function (e) {
                            $('#error-rnc').removeClass('animated shake');
                        });
                    $("#error-holder").html("room name is already taken");
                } else {
                    $('#error-nc').addClass("animated shake");
                    $("#name-create").addClass("error");
                    $('#error-nc').one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
                        function (e) {
                            $('#error-nc').removeClass('animated shake');
                        });
                    $('#error-rnc').addClass("animated shake");
                    $("#room-name-create").addClass("error");
                    $('#error-rnc').one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
                        function (e) {
                            $('#error-rnc').removeClass('animated shake');
                        });
                }
            }
        });
    }
};

function change_title_font() {
    if ($("#title-text").width() > 0) {
        var cardWidth = $(".wrapper").width();
        $("#title-text").css('font-size', 48);
        var fontSize = 48;
        while ($("#title-text").width() > cardWidth && fontSize > 10) {
            fontSize -= 1;
            $("#title-text").css('font-size', fontSize);
        }
    }
}