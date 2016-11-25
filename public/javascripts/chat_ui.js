/**
 * Created by user on 2016-05-19.
 */

//신뢰도에 따른 사용자, 시스템의 메시지를 가공
function divEscapedContentElement(message) {
    return $('<div></div>').text(message);
}
function divSystemContentElement(message) {
    return $('<div></div>').html('<i>' + message + '</i>');
}

//슬래시(/)로 시작하는 문자는 명령어, 이외에는 채팅방 대화글 목록으로
function processUserInput(chatApp, socket) {
    var message = $('#send-message').val();
    var systemMessage;

    if(message.charAt(0) == '/'){
        systemMessage = chatApp.processCommand(message);
        if(systemMessage) {
            $('#messages').append(divSystemContentElement(systemMessage));
        }
    }else{
        chatApp.sendMessage($('#room').text(), message);
        $('#messages').append(divEscapedContentElement(message));
        $('#messages').scrollTop($('#messages').prop('scrollHeight'));
    }
    $('#send-message').val('');
}

//클라이언트 App 초기화
var socket = io.connect();

$(document).ready(function () {
    var ChatApp = new Chat(socket);

    //닉네임 변경 요청 결과 출력
    socket.on('nameResult', function (result) {
        var message;

        if(result.success){
            message = 'You are now known as' + result.name + '.';
        }else{
            message = result.message;
        }
        $('#messages').append(divSystemContentElement(message));
    });
    //채팅방 변경 결과 출력
    socket.on('joinResult', function (result) {
        $('#room').text(result.room);
        $('#messages').append(divSystemContentElement('Room changed.'));
    });
    //수신 메시지 출력
    socket.on('message', function (message) {
        var newElement = $('<div></div>').text(message.text);
        $('#messages').append(newElement);
    });
    //채팅방 목록 출력
    socket.on('rooms', function (rooms) {
        $('#room-list').empty();
        for (var room in rooms){
            room = room.substring(1, room.length);
            if(room != ''){
                $('#room-list').append(divEscapedContentElement(room));
            }
        }
        $('#room-list div').click(function () {
            chatApp.processCommand('/join' + $(this).text());
            $('#send-message').focus();
        });
    });
    setInterval(function () {
        socket.emit('rooms');
    }, 1000);

    $('#send-message').focus();

    $('#send-form').submit(function () {
        processUserInput(chatApp, socket);
        return false;
    });
});     //document.ready 끝
