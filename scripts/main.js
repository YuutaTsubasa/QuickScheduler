document.addEventListener("DOMContentLoaded", function(){
    let header = document.querySelector("header");
    if (header){
        header.addEventListener("click", function(event){
            location.assign("/");
        });
    }
});