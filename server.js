var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

//파일이 존재하지 않을 때 404에러 전송
function send404(response) {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Error 404: response not found');
    response.end();
}
//파일 데이터 서비스
function sendFile(response, filePath, fileContents) {
    response.writeHead(
        200,
        {"content-type": mime.lookup(path.basename(filePath))}
    );
    response.end(fileContents);
}
//캐시에 파일존재 체크, 있으면 서비스, 없으면 디스크에서 서비스
function serveStatic(response, cache, absPath) {
    if (cache[absPath]){
        sendFile(response, absPath, cache[absPath]);
    }else{
        fs.exists(absPath, function (exists) {
            if(exists){
                fs.readFile(absPath, function (err, data) {
                    if(err){
                        send404(response);
                    }else{
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            } else{
                send404(response);
            }
        });
    }
}
//HTTP 서버 생성
var server = http.createServer(function (request, response) {
    var filePath = false;
    if(request.url == '/') {
        filePath = 'public/index.html';
    } else{
        filePath = 'public' + request.url;
    }
    var absPath = './' + filePath;
    serveStatic(response, cache, absPath);
});
//HTTP 서버 구동
server.listen(3000, function () {
    console.log("Server listening on port 3000.")
});
//Socket.IO 기반 대화기능 로직을 제공하는 커스텀 모듈 가져오기
//Socket.IO 서버 기능
var chatServer = require('./lib/chat_server');
chatServer.listen(server);

