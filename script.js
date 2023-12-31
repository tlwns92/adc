// 중복확인 버튼 클릭시 실행되는 함수
function selectCategory(category) {
  window.location.href = category;
}
// get the current page URL and extract the category from it
var currentPageURL = window.location.href;
var category = currentPageURL.substring(currentPageURL.lastIndexOf('/')+1);


Dropzone.options.demoUpload = {
  maxFilesize: 10,
  init: function() {
    var self = this;
    var uploadPath; // 업로드 경로 변수

    // maxFiles 옵션 추가
    this.options.maxFiles = 10;

    this.on("addedfiles", function(files) {
      // 파일이 추가될 때 실행되는 이벤트 핸들러
      var fileArray = Array.from(files); // 파일 배열

      var validFiles = [];
      var invalidFiles = [];

      // 파일을 확인하여 유효한 파일과 유효하지 않은 파일로 분류
      fileArray.forEach(function(file) {
        var extension = file.name.split(".").pop().toLowerCase();
        console.log("filename : " + file.name);
        console.log("ext : " + extension);
        if (extension === "dicom" || extension === "dcm") {
          // 파일 크기가 1MB를 초과하지 않는 경우에만 유효한 파일로 분류
          if (file.size <= self.options.maxFilesize * 1024 * 1024) {
            validFiles.push(file);
            console.log("valid dicom file : " + file.name);
          } else {
            var logMessage =
              "Upload failed(dropzone): file size over filename - " +
              file.name +
              " , filesize - " +
              (file.size / (1024 * 1024)).toFixed(2) +
              "MB";
            doWriteLog(logMessage);
            invalidFiles.push(file);
          }

        } else {
          invalidFiles.push(file);
          console.log("invalid dicom file : " + file.name);
        }
      });

      if (validFiles.length === 0) {
        // 유효한 파일이 없을 때
        var logMessage =
          "Upload failed(dropzone): It's not a Dicom file  filename - " +
          invalidFiles.map((file) => file.name).join(", ");
        doWriteLog(logMessage);
        self.removeAllFiles(); // 모든 파일 제거
        alert("aaOnly" + self.options.maxFilesize +"MB DICOM files can be uploadedaaa.");
        return;
      }

      if (validFiles.length > 5) {
        // 5개 이상의 유효한 파일을 추가하려고 할 때
        var logMessage =
          "Upload failed(dropzone): Upload File Count Exceeded ";
        doWriteLog(logMessage);
        self.removeAllFiles(); // 모든 파일 제거
        alert("Only 5 files can be uploaded.");
        return;
      }

      // 임의의 폴더 경로 생성
      var timestamp = Date.now().toString();
      var randomNum = Math.floor(Math.random() * 1000).toString();
      uploadPath = "../upload/" + timestamp + randomNum + "/";
      console.log("upload path : " + uploadPath);
      console.log("valid file : " + validFiles);

      // FormData 객체 생성
      var formData = new FormData();
      formData.append("uploadPath", uploadPath); // 업로드 경로 추가
      validFiles.forEach(function(file) {
        console.log("File:", file); // 파일 정보 출력
        formData.append("files[]", file); // 유효한 파일 추가
      });
      console.log("formData:", formData);
      doWriteLog(
        "script to upload_check.php: success - " +
          validFiles.map((file) => file.name).join(", ") +
          ", fail - " +
          invalidFiles.map((file) => file.name).join(", ")
      );

      // AJAX 요청을 통해 폴더 생성과 파일 이동 또는 복사 작업 수행
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "/controller/upload_check.php");

      xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            console.log("Files uploaded successfully");
            try {
              var response = JSON.parse(xhr.responseText);
              if (response.status === "success") {
                console.log("File information saved to the database.");
                var request_list=[];
                response.uploadedFiles.forEach(function(uploadedFile) {
                var request_path = uploadedFile.filePath.replace('../', '/var/www/html/');
                request_list.push(request_path)
                // displayDICOM(uploadedFile.filePath, uploadedFile.uploadNum);
                location.reload();
                //changePage(1);

                });
              var inferenceXhr = new XMLHttpRequest();
              inferenceXhr.open("POST", "/controller/inference");

              inferenceXhr.onreadystatechange = function() {
           	 if (inferenceXhr.readyState === XMLHttpRequest.DONE) {
                    if (inferenceXhr.status === 200) {
                        // JSON 결과 값 처리
                        var inferenceResponse = JSON.parse(inferenceXhr.responseText);
                        console.log("Received inference response:", inferenceResponse);
              	    } else {
                        console.error("Error receiving inference response");
                    }
                }
              };

          var requestData = JSON.stringify(request_list);
          inferenceXhr.setRequestHeader("Content-Type", "application/json");
          inferenceXhr.send(requestData);
          //changePage(1);
          //location.reload();


              } else {
                console.error(
                  "Failed to save file information to the database."
                );
              }
            } catch (error) {
              console.error("Error parsing server response: ", error);
            }
          } else {
            console.log("Error uploading files");
          }
        }
      };

      xhr.send(formData);

      // 유효하지 않은 파일 알림 출력
      if (invalidFiles.length > 0) {
        var invalidFileNames = invalidFiles.map(function(file) {
          return file.name;
        });
        var alertMessage =
          "Only " + self.options.maxFilesize +"MB DICOM files can be uploaded.\nExcluded files: " +
          invalidFileNames.join(", ");
        alert(alertMessage);
      }
    });

    this.on("complete", function() {
      self.removeAllFiles();
    });
  },
};


function doWriteLog(logMessage) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/controller/write_log.php");
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        console.log("Log written successfully");
      } else {
        console.log("Error writing log");
      }
    }
  };

  xhr.send("logMessage=" + encodeURIComponent(logMessage));
}



function drawGraph(zScoreValue) {
    var canvas = document.getElementById("graphCanvas");

    if (canvas) {
        var context = canvas.getContext("2d");


        // 그래프 크기 및 여백 설정
        var graphWidth = canvas.width - 200;
        var graphHeight = canvas.height - 40;
        var marginLeft = 150;
        var marginBottom = 40;
        var y_position = [170,130,90,50,10,-30,-70,-110,-150];
        var points = [];

        for(var i=0; i<9; i++){
          var x = zScoreValue[i];
          var y = y_position[i];

          if (x !== null){
            points.push({ x: x, y: y });
          }
        }
        // 그래프 그리기
         context.fillStyle = "blue";
        context.strokeStyle = "black";
        context.font = "bold 16px Arial";
        context.fillStyle = "black";

        // x 축 그리기
        context.beginPath();
        context.moveTo(marginLeft, canvas.height - marginBottom);
        context.lineTo(marginLeft + graphWidth, canvas.height - marginBottom);
        context.stroke();

        // x 축 눈금 표시
        context.textAlign = "center";
        for (var i = -2.5; i <= 2.5; i += 0.5) {
            var x = marginLeft + (graphWidth / 5) * (i + 2.5);
            context.fillText(i.toString(), x, canvas.height - marginBottom + 20);
        }

        // y 축 그리기 (중앙에 위치)
        context.beginPath();
        context.setLineDash([2, 2]); // 점선 설정
        context.moveTo(marginLeft + graphWidth / 2, canvas.height - marginBottom);
        context.lineTo(marginLeft + graphWidth / 2, marginBottom);
        context.stroke();

        // 좌표값에 따라 점 그리기
        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            var x = marginLeft + (graphWidth / 5) * ((Math.min(Math.max(point.x, -2.5), 2.5) + 2.5) / 5) * 5; // x좌표를 -2.5에서 2.5 범위로 조정하여 정규화
            var y = canvas.height / 2 - (graphHeight / 200) * (point.y / 2);

            // 좌표 점 그리기
            context.beginPath();
            context.arc(x, y, 5, 0, 2 * Math.PI);
            context.fillStyle = "black";
            context.fill();
            context.strokeStyle = "black";
            context.stroke();

            // x좌표값 오른쪽 벽에 붙여서 출력 (가운데 정렬, 아래로 5px 내리기)
            context.textAlign = "center";
           //context.fillText(point.x.toFixed(2), canvas.width - 20, y +4);
          if (point.x !== null) {
           context.fillText(point.x.toFixed(2), canvas.width - 20, y +4);

          } else {

          }
        }
        context.textAlign = "start";
        context.fillText("CT ratio", canvas.width - 700, 60);
        context.fillText("Rt upper CB", canvas.width - 700, 100);
        context.fillText("Rt lower CB", canvas.width - 700, 140);
        context.fillText("Aortic knob", canvas.width - 700, 180);
        context.fillText("Pulmonary conus", canvas.width - 700, 220);
        context.fillText("LA appendage", canvas.width - 700, 260);
        context.fillText("Lt lower CB", canvas.width - 700, 300);
        context.fillText("DAO", canvas.width - 700, 340);
        context.fillText("Carina angle", canvas.width - 700, 385);
    } else {
    }
}


function disableRightClick() {
            $(document).bind("contextmenu", function(e) {
                return false;
            });
}

$(document).ready(function() {
            disableRightClick(); // 페이지 로드 시 우클릭 막기 실행
});








/*
function loadDICOM(fileURL, elementId) {
    const element = document.getElementById(elementId);
    const imageId = `wadouri:${fileURL}`;

    cornerstone.enable(element);
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
  cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

cornerstoneWADOImageLoader.configure({
    beforeSend: function(xhr) {
    }
});

cornerstone.loadImage(imageId).then(image => {
    cornerstone.displayImage(element, image);
});
}

function displayDICOM(filePath, uploadNum) {
  var recordsElement = document.getElementById("records");

  var recordElement = document.createElement("div");
  recordElement.className = "record";
  recordElement.id = "record-" + uploadNum;

  var categoryButtonsElement = document.createElement("div");
  categoryButtonsElement.className = "category-buttons";
  categoryButtonsElement.id = "category-buttons-" + uploadNum;

  var originalButton = document.createElement("button");
  originalButton.className = "category-button";
  originalButton.classList.add("active");
  originalButton.id = "dicom-" + uploadNum;
  originalButton.setAttribute("data-category", "original");
  originalButton.textContent = "DICOM Image";
  originalButton.onclick = function() {
    changeCategory(uploadNum, "original", filePath);
  };

  var analysisButton = document.createElement("button");
  analysisButton.className = "category-button";
  analysisButton.id = "analyzed-" + uploadNum;
  analysisButton.setAttribute("data-category", "analysis");
  analysisButton.textContent = "Analyzed Image";
  analysisButton.onclick = function() {
    changeCategory(uploadNum, "analysis", filePath);
  };

  var resultButton = document.createElement("button");
  resultButton.className = "category-button";
  resultButton.id = "result-" + uploadNum;
  resultButton.setAttribute("data-category", "result");
  resultButton.textContent = "Result Value";
  resultButton.onclick = function() {
    changeCategory(uploadNum, "result", filePath);
  };

  categoryButtonsElement.appendChild(originalButton);
  categoryButtonsElement.appendChild(analysisButton);
  categoryButtonsElement.appendChild(resultButton);

  var viewerContainer = document.createElement("div");
  viewerContainer.id = "viewercontainer-" + uploadNum;
  viewerContainer.style.display = "flex";
  viewerContainer.style.justifyContent = "center";
  viewerContainer.style.alignItems = "center";

  var dicomViewerport = document.createElement("div");
  dicomViewerport.className = "dicomViewerport";
  dicomViewerport.id = "dicomViewerport-" + uploadNum;
  dicomViewerport.style.height = "300px";
  dicomViewerport.style.width = "300px";
  dicomViewerport.style.marginRight = "50px";

  var downloadContainer = document.createElement("div");
  downloadContainer.className = "download-container";
  downloadContainer.style.textAlign = "center";
  downloadContainer.innerHTML = `
    <br><br><h4>Download analyzed data as a zip file.</h4><br><button class="download-button">ZIP Download</button>
  `;

  viewerContainer.appendChild(dicomViewerport);
  viewerContainer.appendChild(downloadContainer);

  recordElement.appendChild(categoryButtonsElement);
  recordElement.appendChild(viewerContainer);

  var firstChild = recordsElement.firstChild;
  recordsElement.insertBefore(recordElement, firstChild);
  loadDICOM(filePath, dicomViewerport.id);
}


function changeCategory(uploadNum, category, filePath) {
  // 해당 레코드의 viewercontainer와 카테고리 버튼을 가져옵니다.
  var viewerContainer = document.getElementById("viewercontainer-" + uploadNum);
  var dicomButton = document.getElementById("dicom-" + uploadNum);
  var analyzedButton = document.getElementById("analyzed-" + uploadNum);
  var resultButton = document.getElementById("result-" + uploadNum);

  // 기존에 활성화되어 있던 버튼의 스타일을 변경합니다.
  dicomButton.classList.remove("active");
  analyzedButton.classList.remove("active");
  resultButton.classList.remove("active");

  // 선택한 카테고리 버튼에 활성화 클래스를 추가합니다.
  if (category === "original") {
    dicomButton.classList.add("active");
    analyzedButton.style.display = "block";
    resultButton.style.display = "block";
    viewerContainer.innerHTML = `
      <div class="dicomViewerport" id="dicomViewerport-${uploadNum}" style="height: 300px; width: 300px; margin-right: 50px;"></div>
      <div class="download-container" style="text-align: center; ">
        <br><br><h4>Download analyzed data as a zip file.</h4><br><button class="download-button">ZIP Download</button>
      </div>
    `;
    loadDICOM(filePath, "dicomViewerport-" + uploadNum);
  } else if (category === "analysis") {
    analyzedButton.classList.add("active");
    dicomButton.style.display = "block";
    resultButton.style.display = "block";
    viewerContainer.innerHTML = `
      <img src="../test/uploads/1000001.png" alt="Analysis Image" class="analysisImage" id="analysisImage-${uploadNum}" width="300" height="300">
      <div class="download-container" style="text-align: center; margin-left: 60px;">
        <br><br><h4>Download analyzed data as a zip file.</h4><br><button class="download-button">ZIP Download</button>
      </div>
    `;
  } else if (category === "result") {
    resultButton.classList.add("active");
    dicomButton.style.display = "block";
    analyzedButton.style.display = "block";

    viewerContainer.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Carina_angle</th>
            <th>&nbsp;&nbsp;&nbsp;&nbsp;Rt Lower CB</th>
            <th>Rt Upper CB</th>
            <th>Aortic Knob</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>87.41420566</td>
            <td>31.031682</td>
            <td>29.864346</td>
            <td>43.7751</td>
          </tr>
        </tbody>
        <thead>
          <tr>
            <th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;DAO</th>
            <th>Pulmonary Conus</th>
            <th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;LAA</th>
            <th>Lt Lower CB</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>0.194962043</td>
            <td>0.187025535</td>
            <td>65.66265</td>
            <td>0.371635611</td>
          </tr>
        </tbody>
      </table>
    `;
  }
}
*/


