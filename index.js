function bblSort(arr){
    for(var i = 0; i < arr.length; i++){
        for(var j = 0; j < ( arr.length - i -1 ); j++){
            if(arr[j][2] < arr[j+1][2]){
                var temp = arr[j]
                arr[j] = arr[j + 1]
                arr[j+1] = temp
            }
        }
    }

    return arr;
}

function find_place(place) {
    var query = place.replace(/ /g, '+');
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '185c6931b0mshdf10fff5abdebccp10646ejsn9bb3bc52ddc8',
            'X-RapidAPI-Host': 'google-maps28.p.rapidapi.com'
        }
    };
    
    return fetch(`https://google-maps28.p.rapidapi.com/maps/api/place/findplacefromtext/json?inputtype=textquery&fields=geometry&input=${query}&language=en`, options)
        .then(response => response.json())
        .then(response => {
            if (response.status == "OK" && response.candidates.length > 0){
                return response.candidates[0].geometry.location;
            }
            else{
                console.log(response);
            }
        })
        .then(data => {
            return data; 
        })
        .catch(err => console.error(err));


    /*
    let response = await fetch(`https://google-maps28.p.rapidapi.com/maps/api/place/findplacefromtext/json?inputtype=textquery&fields=place_id&input=${query}&language=en`, options);
    var data = await response.json()
    if (response.status == "OK" && response.candidates.length > 0){
        query = response.candidates[0].place_id;
    }
    else{
        console.log(response);
    }  
    */

    //return resp;
}

function nearby_places(pivot, type) {
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '185c6931b0mshdf10fff5abdebccp10646ejsn9bb3bc52ddc8',
            'X-RapidAPI-Host': 'google-maps28.p.rapidapi.com'
        }
    };
    
    return fetch(`https://google-maps28.p.rapidapi.com/maps/api/place/nearbysearch/json?location=${pivot}&radius=5000&language=en&rankby=prominence&type=${type}`, options)
        .then(response => response.json())
        .then(response => response.results)
        .then(results => {
            let farr = [];
            let element = [];
            let lat, lng;

            results.forEach(concise)
            function concise (item, index){
                if (item.rating){
                    element = [];
                    lat = item.geometry.location.lat
                    lng = item.geometry.location.lng
                    element.push(`${lat},${lng}`)
                    element.push(item.name)
                    element.push(item.rating)
                    farr.push(element)
                }
            }

            return bblSort(farr);
        })
        .catch(err => console.error(err));
}

(() => {
    var key = 'AIzaSyAeV_FlVvt9ze10kpv6FtoUL0JuPU3V5y4'; //GMaps Embed Key
    var myframe = document.querySelector('#myframe');   //Embed frame
    myframe.src = `https://www.google.com/maps/embed/v1/place?q=India&key=${key}`
    var query, current_loc;

    // check if the Geolocation API is supported - browser inbuilt
    if (!navigator.geolocation) {
        message.textContent = `Your browser doesn't support Geolocation`;
        message.classList.add('error');
        return;
    }

    // handle click event
    const btn = document.getElementById('myloc');
    btn.addEventListener('click', function () {
        // get the current position
        navigator.geolocation.getCurrentPosition(
            onSuccess,
            onError,
            {enableHighAccuracy: true, maximumAge: 0 }
            );
    });

    const btn2 = document.getElementById('searchbtn');
    btn2.addEventListener('click', searchLoc)

    function searchLoc() {
        //Location from text input
        console.log(current_loc);
        var ip = document.getElementById('mysearch');

        if (ip.value) {
            query = ip.value.replace(/ /g, '+');

            find_place(query).then((pid) => {
                let squery = pid.lat.toString().concat(',', pid.lng.toString())
                if (current_loc != squery && squery){
                    current_loc = squery;
                    myframe.src = `https://www.google.com/maps/embed/v1/place?q=${squery}&key=${key}`;
                    create_data_buttons();
                }
            }
            )
        }
    }

    // handle success case
    function onSuccess(position) {
        const {
            latitude,
            longitude
        } = position.coords;

        query = `${latitude},${longitude}`;
        if (current_loc != query){
            current_loc = query;
            myframe.src = `https://www.google.com/maps/embed/v1/place?q=${query}&key=${key}`;
            create_data_buttons()
        }

        // message.classList.add('success');
        // message.textContent = `Your location: (${latitude},${longitude})`;
    }

    // handle error case
    function onError() {
        message.classList.add('error');
        message.textContent = `Failed to get the location!`;
    }

    function data_fetch(mode){
        var search_for;
        if (mode == 0){
            search_for = 'lodging'
        }
        else if (mode == 1){
            search_for = 'restaurant'
        }
        else if (mode == 2){
            search_for = 'tourist_attraction'
        }

        nearby_places(current_loc, search_for)
            .then(results => {
                var table = document.getElementById("dtable");
                table.innerHTML = "";
                var row_no = 0;
                var row = table.insertRow(row_no++);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                cell1.innerHTML = "<b>Place</b>";
                cell2.innerHTML = "<b>Rating ⭐</b>";
                var tag;

                results.forEach(row_ins);
                function row_ins (item, index){
                    row = table.insertRow(row_no++);
                    cell1 = row.insertCell(0);
                    cell2 = row.insertCell(1);

                    tag = document.createElement('a');
                    tag.href = "javascript:void(0)";
                    tag.onclick = function () {
                        myframe.src = `https://www.google.com/maps/embed/v1/directions?key=${key}&origin=${current_loc}&destination=${item[0]}&avoid=tolls|highways`
                    }
                    tag.innerHTML = item[1]

                    cell1.appendChild(tag)
                    cell2.innerHTML = item[2]
                }

                if(row_no == 0){
                    table.innerHTML = "";
                }
            })

        //table.textContent = `${mode} clicked`;
        //console.log(`${mode} clicked!`);
    }

    function create_data_buttons() {
        const dcontainer = document.getElementById('dbcontainer');

        dcontainer.innerHTML = "";

        var hbtn = document.createElement('button');
        hbtn.id = 'hotelbtn'
        hbtn.type = 'button';
        hbtn.innerHTML = "Hotels/Lodging"
        hbtn.className = "btn"
        hbtn.style = "margin-right:3mm"
        hbtn.onclick = function () {
            data_fetch(0);
        };

        var rbtn = document.createElement('button');
        rbtn.id = 'restbtn'
        rbtn.type = 'button';
        rbtn.innerHTML = "Restaurants"
        rbtn.className = "btn"
        rbtn.style = "margin-right:3mm"
        rbtn.onclick = function () {
            data_fetch(1);
        };

        var abtn = document.createElement('button');
        abtn.id = 'attrnbtn'
        abtn.type = 'button';
        abtn.innerHTML = "Attractions"
        abtn.className = "btn"
        abtn.onclick = function () {
            data_fetch(2);
        }

        dcontainer.appendChild(hbtn);
        dcontainer.appendChild(rbtn);
        dcontainer.appendChild(abtn);

        var table = document.getElementById("dtable");
        table.innerHTML = "";
    }
})();
