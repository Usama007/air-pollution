import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const Map = ({city}) => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [allMarkers, setAllMarkers] = useState({});
  const [citySearch, setCitySearch] = useState(city);
  const token = "e9cb8cfe77f56438efccb60cd5eb4cea4506e8ee";

  const [firstTime, setfirstTime] = useState(true);


  useEffect(() => {
    setCitySearch(city)
    searchByCity(city)
  
  }, [city])
  

  const initializeMap = () => {
    const OpenStreetMap_Mapnik = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    );

    const newMap = L.map(mapContainerRef.current, {
      attributionControl: false,
      gestureHandling: true,
      zoomSnap: 0.1,
    })
      .setView([0, 0], 12)
      .addLayer(OpenStreetMap_Mapnik); 

    setTimeout(() => {
      newMap.on("moveend", () => {
        const bounds = newMap.getBounds();
        const boundsString =
          bounds.getNorth() +
          "," +
          bounds.getWest() +
          "," +
          bounds.getSouth() +
          "," +
          bounds.getEast();
        document.getElementById("leaflet-map-bounds").innerHTML =
          "bounds: " + boundsString.split(",").join(", ");

        populateMarkers(newMap, boundsString, true);
      });
    }, 1000);

    setMap(newMap);

    return newMap;
  };

  const populateMarkers = async (map, bounds, isRefresh) => {
    try {
      const response = await fetch(
        `https://api.waqi.info/v2/map/bounds/?latlng=${bounds}&token=${token}`
      );
      const stations = await response.json();

      if (stations.status !== "ok") throw stations.data;

      stations.data.forEach((station) => {
        if (allMarkers[station.uid]) map.removeLayer(allMarkers[station.uid]);

        const iw = 83,
          ih = 107;
        const icon = L.icon({
          iconUrl: `https://waqi.info/mapicon/${station.aqi}.30.png`,
          iconSize: [iw / 2, ih / 2],
          iconAnchor: [iw / 4, ih / 2 - 5],
        });

        const marker = L.marker([station.lat, station.lon], {
          zIndexOffset: station.aqi,
          title: station.station.name,
          icon: icon,
        }).addTo(map);

        marker.on("click", () => {
          const popup = L.popup()
            .setLatLng([station.lat, station.lon])
            .setContent(station.station.name)
            .openOn(map);

          getMarkerPopup(station.uid).then((info) => {
            popup.setContent(info);
          });
        });

        setAllMarkers((prevMarkers) => ({
          ...prevMarkers,
          [station.uid]: marker,
        }));
      });

      document.getElementById("leaflet-map-error").style.display = "none";
      return stations.data.map(
        (station) => new L.LatLng(station.lat, station.lon)
      );
    } catch (error) {
      const o = document.getElementById("leaflet-map-error");
      o.innerHTML = "Sorry...." + error;
      o.style.display = "";
    }
  };

  const populateAndFitMarkers = (map, bounds) => {
    removeMarkers(map);
    if (bounds.split(",").length === 2) {
      let [lat, lng] = bounds.split(",");
      lat = parseFloat(lat);
      lng = parseFloat(lng);
      bounds = `${lat - 0.5},${lng - 0.5},${lat + 0.5},${lng + 0.5}`;
    }
    populateMarkers(map, bounds).then((markerBounds) => {
      const [lat1, lng1, lat2, lng2] = bounds.split(",");
      const mapBounds = L.latLngBounds(
        L.latLng(lat2, lng2),
        L.latLng(lat1, lng1)
      );
      map.fitBounds(mapBounds, { maxZoom: 12, paddingTopLeft: [0, 40] });
    });
  };

  const removeMarkers = (map) => {
    Object.values(allMarkers).forEach((marker) => map.removeLayer(marker));
    setAllMarkers({});
  };

  const getMarkerPopup = async (markerUID) => {
    const marker = await getMarkerAQI(markerUID);
    let info =
      marker.city.name +
      ": AQI " +
      marker.aqi +
      " updated on " +
      new Date(marker.time.v * 1000).toLocaleTimeString() +
      "<br>";

    if (marker.city.location) {
      info += "<b>Location</b>: ";
      info += "<small>" + marker.city.location + "</small><br>";
    }

    const pollutants = ["pm25", "pm10", "o3", "no2", "so2", "co"];

    info += "<b>Pollutants</b>: ";
    for (const specie in marker.iaqi) {
      if (pollutants.indexOf(specie) >= 0)
        info += "<u>" + specie + "</u>:" + marker.iaqi[specie].v + " ";
    }
    info += "<br>";

    info += "<b>Weather</b>: ";
    for (const specie in marker.iaqi) {
      if (pollutants.indexOf(specie) < 0)
        info += "<u>" + specie + "</u>:" + marker.iaqi[specie].v + " ";
    }
    info += "<br>";

    info += "<b>Attributions</b>: <small>";
    info += marker.attributions
      .map(
        (attribution) =>
          "<a target=_ href='" +
          attribution.url +
          "'>" +
          attribution.name +
          "</a>"
      )
      .join(" - ");
    return info;
  };

  const getMarkerAQI = async (markerUID) => {
    const response = await fetch(
      `https://api.waqi.info/feed/@${markerUID}/?token=${token}`
    );
    const data = await response.json();

    if (data.status !== "ok") throw data.reason;
    return data.data;
  };

  const init = () => {
    if (!map) {
      const newMap = initializeMap();

      const locations = {
        Beijing: "39.379436,116.091230,40.235643,116.784382",
        Bucharest:
          "44.50858895332098,25.936583232631918,44.389144165939854,26.300222840009447",
        London:
          "51.69945358064312,-0.5996591366844406,51.314690280921894,0.3879568209963314",
        Bangalore:
          "13.106898860432123,77.38497433246386,12.825861486200223,77.84571346820603",
        Gdansk: "54.372158,18.638306",
        Paris: "48.864716,2.349014",
        "Los Angeles": "34.052235,-118.243683",
        Seoul: "37.532600,127.024612",
        Jakarta: "-6.200000,106.816666",
      };

      let oldButton;
      const addLocationButton = (location, bounds) => {
        const button = document.createElement("div");
        button.classList.add("ui", "button", "tiny");
        document.getElementById("leaflet-locations").appendChild(button);
        button.innerHTML = location;
        const activate = () => {
          populateAndFitMarkers(newMap, bounds);
          if (oldButton) oldButton.classList.remove("primary");
          button.classList.add("primary");
          oldButton = button;
        };
        button.onclick = activate;
        return activate;
      };

      Object.keys(locations).forEach((location, idx) => {
        const bounds = locations[location];
        const activate = addLocationButton(location, bounds);
        if (idx === 0) activate();
      });

      fetch(`https://api.waqi.info/v2/feed/here/?token=${token}`)
        .then((x) => x.json())
        .then((x) => {
          addLocationButton(x.data.city.name, x.data.city.geo.join(","));
        });
    }
  };

  
  const searchByCity = async (city = null) => {
    try {
      const response = await fetch(
        `https://api.waqi.info/search/?token=${token}&keyword=${encodeURIComponent(
            city ?? citySearch
        )}`
      );
      const data = await response.json();
  
      if (data.status === "ok" && data.data.length > 0) {
        const station = data.data[0].station;
        if (station) {
          const bounds = `${station.geo[0] - 0.5},${station.geo[1] - 0.5},${station.geo[0] + 0.5},${station.geo[1] + 0.5}`;
          populateAndFitMarkers(map, bounds);
        } else {
          console.error("No station information found for the city");
        }
      } else {
        console.error("City not found");
      }
    } catch (error) {
      console.error("Error searching for city:", error);
    }
  };


  useEffect(() => {
    if (firstTime) {
      setfirstTime(false);
      setTimeout(() => {
        init();

      }, 1000);

    }
  }, [map, allMarkers, citySearch]);

  return (
    <>
      <div
        ref={mapContainerRef}
        id="leaflet-map"
        style={{ height: "800px" }}
      ></div>
      <div style={{display:'none'}}>
        <input
          type="text"
          placeholder="Enter city name"
          value={citySearch}
          onChange={(e) => setCitySearch(e.target.value)}
        />
        <button onClick={searchByCity}>Search</button>
      </div>
      <div style={{display:'none'}} id="leaflet-locations"></div>
      <div  style={{display:'none'}} id="leaflet-map-bounds"></div>
      <div style={{display:'none'}} id="leaflet-map-error"></div> 
      {/* Add any other JSX content as needed */}
    </>
  );
};

export default Map;