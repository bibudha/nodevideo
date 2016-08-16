var webcamVideo = document.getElementById("webcamVideo");
var timePreview = document.querySelector('#time-preview');
var progressPreview = document.querySelector('#progress-preview');


var refToMediaStream;
var startTime;

var ajaxloderWrap = document.getElementById("ajaxloderWrap");
var video_no_played = document.getElementById("video_no_played");
var downloadVideo = document.getElementById("downloadVideo");

var socket = io.connect('/');

document.querySelector('#start-recording').onclick = function() {
    this.disabled = true;

    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;
    navigator.getUserMedia({
        audio: true,
        video: true
    }, function(stream) {
        refToMediaStream = stream;
        webcamVideo.src = URL.createObjectURL(stream);

        var randomString = (Math.random() * 1000).toString().replace('.', '');

        webcamVideo.ontimeupdate = function() {
            var duration = formatSecondsAsTime(this.currentTime);
            startTime = duration;
            timePreview.innerHTML = duration;
        };

        RecorderHelper.StartRecording({
            MediaStream: stream,
            Socket: socket,
            FileName: randomString,
            roomId: 'room-' + randomString,
            userId: 'user-' + randomString,
            UploadInterval: 3 * 1000
        });

        RecorderHelper.OnComplete = function(fileName) {
            stream.stop();
            var src = '/uploads' + '/room-' + randomString + '/user-' + randomString + '.webm';
            downloadVideo.href = src;
            downloadVideo.style.display = 'block';
            ajaxloderWrap.style.display = 'none';
            webcamVideo.src = src;
            webcamVideo.play();

            // progressPreview.innerHTML = '00:00';
        };

        RecorderHelper.OnProgress = function(response) {
            var timetrack = response.progress.timemark;
            var values = timetrack.split(':').slice(1);

            var endTime = values[0] + ':' + values[1];
            // progressPreview.innerHTML = getTime(startTime, endTime);
        };

        document.querySelector('#stop-recording').disabled = false;
    }, function(error) {
        alert(JSON.stringify(error));
    });
};

function getTime(intime, out) {
    // var intime = '00:15';
    // var out = '00:02';

    function toSeconds(s) {
        var p = s.split(':');
        return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
    }

    function fill(s, digits) {
        s = s.toString();
        while (s.length < digits) s = '0' + s;
        return s;
    }

    var sec = toSeconds(intime) - toSeconds(out);

    var result = fill(Math.floor(sec / 60) % 60, 2) + ':' + fill(sec % 60, 2);

    return result;
}

function formatSecondsAsTime(secs) {
    var hr = Math.floor(secs / 3600);
    var min = Math.floor((secs - (hr * 3600)) / 60);
    var sec = Math.floor(secs - (hr * 3600) - (min * 60));

    if (min < 10) {
        min = "0" + min;
    }
    if (sec < 10) {
        sec = "0" + sec;
    }

    return min + ':' + sec;
}

document.querySelector('#stop-recording').onclick = function() {
    ajaxloderWrap.style.display = 'block';
    this.disabled = true;
    RecorderHelper.StopRecording();

    webcamVideo.src = null;

    if (true || !refToMediaStream) return;
    refToMediaStream.stop();
    refToMediaStream = null;
};


var video_player = document.getElementById("video_player");
video = video_player.getElementsByTagName("video")[0],
    video_links = video_player.getElementsByTagName("figcaption")[0],
    source = video.getElementsByTagName("source"),
    link_list = [],
    vidDir = "http://thenewcode.com/assets/videos/",
    currentVid = 0,
    allLnks = video_links.children,
    lnkNum = allLnks.length;
video.removeAttribute("controls");
// video.removeAttribute("poster");
var videoIsPlaying = false;
var videoContainer = document.getElementById("video_container");

(function() {

 navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;
    if (navigator.getUserMedia) {
  // Request the camera.
  navigator.getUserMedia(
    // Constraints
    {
      video: true
    },

    // Success Callback
    function(localMediaStream) {
        video_no_played.style.display = 'none';
    },

    // Error Callback
    function(err) {
      // Log the error to the console.
      video_no_played.style.display = 'block';
      console.log('The following error occurred when trying to use getUserMedia');
      console.log(err);
    }
  );

} else {
    video_no_played.style.display = 'block';
    console.log('Sorry, your browser does not support getUserMedia');
}

    function playVid(index) {
        video_links.children[index].classList.add("currentvid");
        source[1].src = vidDir + link_list[index] + ".webm";
        source[0].src = vidDir + link_list[index] + ".mp4";
        currentVid = index;
        video.load();
        video.play();
    }

    for (var i = 0; i < lnkNum; i++) {
        var filename = allLnks[i].href;
        link_list[i] = filename.match(/([^\/]+)(?=\.\w+$)/)[0];
        (function(index) {
            allLnks[i].onclick = function(i) {
                i.preventDefault();
                for (var i = 0; i < lnkNum; i++) {
                    allLnks[i].classList.remove("currentvid");
                }
                playVid(index);
            }
        })(i);
    }
    videoContainer.addEventListener('click', function() {
        if (!videoIsPlaying) {
            video.play();
            videoIsPlaying = true;
        } else {
            video.pause();
            videoIsPlaying = false;
        }
    })
    video.addEventListener('ended', function() {
        /*allLnks[currentVid].classList.remove("currentvid");
        if ((currentVid + 1) >= lnkNum) { nextVid = 0 } else { nextVid = currentVid + 1 }
        playVid(nextVid);*/
        document.querySelector('#stop-recording').click();
        console.log("video ended")
    })

    video.addEventListener('play', function() {
        /*allLnks[currentVid].classList.remove("currentvid");
        if ((currentVid + 1) >= lnkNum) { nextVid = 0 } else { nextVid = currentVid + 1 }
        playVid(nextVid);*/
        document.querySelector('#start-recording').click();
        console.log("video play")
    })

    /*video.addEventListener('pause', function() {
        document.querySelector('#stop-recording').click();
        videoIsPlaying = false;
        console.log("video pause")
    })*/


    video.addEventListener('mouseenter', function() {
        video.setAttribute("controls", "true");
    })

    video.addEventListener('mouseleave', function() {
        video.removeAttribute("controls");
    })

    var indexOf = function(needle) {
        if (typeof Array.prototype.indexOf === 'function') {
            indexOf = Array.prototype.indexOf;
        } else {
            indexOf = function(needle) {
                var i = -1,
                    index = -1;
                for (i = 0; i < this.length; i++) {
                    if (this[i] === needle) {
                        index = i;
                        break;
                    }
                }
                return index;
            };
        }
        return indexOf.call(this, needle);
    };
    var focusedLink = document.activeElement;
    index = indexOf.call(allLnks, focusedLink);

    document.addEventListener('keydown', function(e) {
        if (index) {
            var focusedElement = document.activeElement;
            if (e.keyCode == 40 || e.keyCode == 39) { // down or right cursor
                var nextNode = focusedElement.nextElementSibling;
                if (nextNode) { nextNode.focus(); } else { video_links.firstElementChild.focus(); }
            }
            if (e.keyCode == 38 || e.keyCode == 37) { // up or left cursor
                var previousNode = focusedElement.previousElementSibling;
                if (previousNode) { previousNode.focus(); } else { video_links.lastElementChild.focus(); }
            }
        }
    });

})();
