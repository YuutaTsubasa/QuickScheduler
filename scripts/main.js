document.addEventListener("DOMContentLoaded", function(){
    let weekly = document.querySelector(".weekly");
    if (weekly){
        function changeWeeklyToFitParent(){
            weekly.style.transform = `scale(${weekly.parentElement.clientWidth / 1920})`; 
        }

        window.addEventListener("resize", function(){
            changeWeeklyToFitParent();
        });
        changeWeeklyToFitParent();

        let downloadButton = document.querySelector("#download_weekly");
        downloadButton.addEventListener("click", function(){
            weekly.style.transform = "scale(1)";

            let originalBorder = weekly.style.border;
            weekly.style.border = "0";
            let newWindow = window.open();
            newWindow.document.write("載入中......");
            domtoimage.toPng(weekly)
                .then(function (_) {
                    domtoimage.toPng(weekly)
                        .then(function (dataUrl) {
                        var img = "<img src='" + dataUrl + "'/>"
                        newWindow.document.body.innerText = "";
                        newWindow.document.write(img);
                        weekly.style.border = originalBorder;
                        changeWeeklyToFitParent();
                    });
                });
        });
    }
});