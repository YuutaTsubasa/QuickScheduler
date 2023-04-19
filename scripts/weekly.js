Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

Date.prototype.getMMDDFormat = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [(mm > 9 ? '' : '0') + mm,
            (dd > 9 ? '' : '0') + dd].join('/');
};

document.addEventListener("DOMContentLoaded", function(){
    const defaultValueSetting = [
        {inputSelector: "#startDate", value: new Date().toDateInputValue()},
        {inputSelector: "#backgroundColor", value: "#666666"}];

    defaultValueSetting.forEach(setting => {
        let element = document.querySelector(setting.inputSelector);
        if (element) {
            element.value = setting.value;
        }
    })
    
    
    const setClassName = function(tag, className, value){
        if (value){
            if (!tag.classList.contains(className)){
                tag.classList.add(className);
            }
        }
        else {
            if (tag.classList.contains(className)){
                tag.classList.remove(className);
            }
        }
    }

    let weekly = document.querySelector(".weekly");
    if (weekly){
        
    
        const memorize = function(){
            [].slice.apply(document.querySelectorAll("input, select, textarea"))
                .filter(input => input.getAttribute("type") !== "file")
                .forEach(input => {
                    localStorage.setItem(input.id, input.value);
                });
        }
    
        const updateWeekly = function(){
            const weekly = document.querySelector(".weekly");
            const backgroundColor = document.querySelector("#backgroundColor").value;
            const backgroundImageUrl = document.querySelector("#backgroundImageUrl").value;
            weekly.style.backgroundColor = backgroundColor;
            weekly.style.backgroundImage = backgroundImageUrl
                ?`url("${backgroundImageUrl}")`
                : "";

            const styleColorSettingName = "styleColor";
            weekly.classList.forEach(className => {
                if (className.includes(styleColorSettingName)){
                    weekly.classList.remove(className);
                }
            });
            const styleColor = document.querySelector(`#${styleColorSettingName}`).value;
            if (styleColor){
                weekly.classList.add(`${styleColorSettingName}_${styleColor}`);
            }
                
            const weeklyLeftPart = document.querySelector(".weekly_left_part");
            const reverseClassName = "reverse";
            const coverArtPosition = document.querySelector("#coverArtPosition").value;
            const coverArtUrl = document.querySelector("#coverArtUrl").value;
            setClassName(weeklyLeftPart, reverseClassName, coverArtPosition === "right");
            
            weeklyLeftPart.style.backgroundImage = coverArtUrl ? `url("${coverArtUrl}")` : "";
    
            const weeklyAuthorPart = document.querySelector(".weekly_author_part");
            const coverDescription = document.querySelector("#coverDescription").value;
            if (coverDescription) {
                weeklyAuthorPart.style.display = "block";
                weeklyAuthorPart.innerHTML = coverDescription;
            }
            else {
                weeklyAuthorPart.style.display = "none";
            }
    
            const weeklyTitle = document.querySelector(".weekly_title");
            const titleDescription = document.querySelector("#titleDescription").value;
            const channelLogoPart = document.querySelector(".channel_logo_part");
            const channelLogoUrl = document.querySelector("#channelLogoUrl").value;
            const hiddenClassName = "hidden";
            weeklyTitle.innerHTML = titleDescription || channelLogoUrl
                ? titleDescription
                : "本週行事曆";
            setClassName(
                weeklyTitle, 
                hiddenClassName, 
                !weeklyTitle.innerHTML);
            
            if (channelLogoPart){
                channelLogoPart.innerHTML = channelLogoUrl
                    ? `<img src="${channelLogoUrl}" />`
                    : "";

                setClassName(
                    channelLogoPart, 
                    hiddenClassName, 
                    !channelLogoPart.innerHTML);
            }


            const communitySettings = document.querySelectorAll(".community_setting input");
            const weeklyCommunity = document.querySelector(".weekly_community ul");
            
            weeklyCommunity.innerHTML = "";
            for(let communitySetting of communitySettings){
                if (!communitySetting.value)
                    continue;

                let className = communitySetting.id.replace("community_", "");
                weeklyCommunity.innerHTML += 
                    `<li><div class="${className}"><img src="/images/community_logo/${className}.svg" alt="${className}" class="logo"/>${communitySetting.value}</div></li>`
            }

            const startDate = new Date(document.querySelector("#startDate").value);
            let contents = [];
            for(let day = 1 ; day <= 7 ; ++day){
                let currentDate = startDate.addDays(day - 1);
                contents.push({
                    "date": currentDate,
                    "title": document.querySelector(`#day${day}Title`).value,
                    "style": document.querySelector(`#day${day}Style`).value,
                    "tag": document.querySelector(`#day${day}Tag`).value,
                    "time": document.querySelector(`#day${day}Time`).value,
                })
            }
    
            const options = { weekday: 'short'};
            const dayItems = document.querySelectorAll(".weekly_item");
            for(let day = 0; day < 7; ++day){
                dayItems[day].querySelector(".date_part").innerText = contents[day].date.getMMDDFormat();

                let weekday = `(${new Intl.DateTimeFormat('zh-TW', options).format(contents[day].date)[1]})`;
                let weekdayPart = dayItems[day].querySelector(".weekday_part");
                let timePart = dayItems[day].querySelector(".time_part");
                
                if (weekdayPart) weekdayPart.innerText = weekday;
                if (timePart) timePart.innerText = contents[day].time;
                
                const content = dayItems[day].querySelector(".content");
                setClassName(content, "stream_off", contents[day].style === "holiday");
                setClassName(content, "hidden", contents[day].style === "none");
                
                const weeklyTags = content.querySelector(".weekly_tags");
                setClassName(weeklyTags, "empty_tags", !contents[day].tag)
                weeklyTags.innerHTML = contents[day].tag
                    ? contents[day].tag.split(",").map(tag => `<li>${tag}</li>`).join("")
                    : "";

                const weeklyDayTitle = content.querySelector(".weekly_day_title");
                weeklyDayTitle.innerHTML = contents[day].title;
            }
    
            memorize();
        }
    
        document.querySelectorAll("input, select, textarea").forEach(input => {
            input.addEventListener("input", updateWeekly);
            const memorizedContent = localStorage.getItem(input.id);
            if (memorizedContent && input.getAttribute("type") !== "file") {
                input.value = memorizedContent;
            }
        });

        document.querySelectorAll(".file_field").forEach(fileFieldSet => {
            let textField = fileFieldSet.querySelector("input[type=text]");
            let fileField = fileFieldSet.querySelector("input[type=file]");
            let hiddenField = fileFieldSet.querySelector("input[type=hidden]");
            
            if (textField.value)
                hiddenField.value = textField.value;

            textField.addEventListener("input", function(){
                hiddenField.value = textField.value;
                fileField.value = "";
                updateWeekly();
            });

            fileField.addEventListener("input", function(event){
                textField.value = "";
                const reader = new FileReader();
                reader.readAsDataURL(event.target.files[0]);
                reader.onload = () => {
                    hiddenField.value = reader.result;
                    updateWeekly();
                };
            });
        });
    
        updateWeekly();

        function changeWeeklyToFitParent(){
            weekly.style.transform = `scale(${weekly.parentElement.clientWidth / 1920})`; 
        }

        window.addEventListener("resize", function(){
            changeWeeklyToFitParent();
        });
        changeWeeklyToFitParent();

        let downloadButton = document.querySelector("#download_weekly");
        downloadButton.addEventListener("click", function(){
            let originalTransition = weekly.style.transition;
            weekly.style.transition = "transform 0s";
            weekly.style.transform = "scale(1)";

            let originalBorder = weekly.style.border;
            weekly.style.border = "0";
            let options = {
                width: 1920,
                height: 1080,
                style: {
                    transtion: "transform 0s",
                    transform: "scale(1)",
                    border: "0"
                }
            };

            let newWindow = window.open();
            newWindow.document.write("載入中......");
            setTimeout(() => {
                domtoimage.toPng(weekly, options)
                .then(function (_) {
                    domtoimage.toPng(weekly, options)
                        .then(function (dataUrl) {
                        var img = "<img src='" + dataUrl + "'/>"
                        newWindow.document.body.innerText = "";
                        newWindow.document.write(img);
                        weekly.style.border = originalBorder;
                        weekly.style.transition = originalTransition;
                        changeWeeklyToFitParent();
                    });
                });
            }, 2000);
        });

        let openSettingsButton = document.querySelector("#open_settings");
        openSettingsButton.addEventListener("click", function(){
            let dataForm = document.querySelector(".data_form");
            let weeklyContainer = document.querySelector(".weekly_container");
            dataForm.classList.toggle("display");
            weeklyContainer.classList.toggle("smaller");
            changeWeeklyToFitParent();
        });
    }
});