import React, {useState, useEffect, Image} from "react";
import hostDataService from "../services/hosts";
import {Link} from "react-router-dom";
//import {Image} from "react-native";
import "../css/styles.css"

const HostsList = (props) => {
  const [hosts, setHosts] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchCountry, setSearchCountry] = useState("");
  const [searchPropertyType, setSearchPropertyType] = useState("");
  const [propertyTypes, setPropertyTypes] = useState(["All Cuisines"]);

  useEffect(() => {
    retrieveHosts();
    retrievePropertyTypes();
  }, []);

  const onChangeSearchName = e => {
    const searchName = e.target.value;
    setSearchName(searchName);
  };

  const onChangeSearchCountry = e => {
    const searchCountry = e.target.value;
    setSearchCountry(searchCountry);
  }

  const onChangeSearchPropertyType = e => {
    const searchPropertyType = e.target.value;
    setSearchPropertyType(searchPropertyType);
  }

  const retrieveHosts = () => {
    hostDataService.getAll()
    .then(response => {
      console.log(response.data);
      setHosts(response.data.hosts);
    })
    .catch(e => {
      console.log(e);
    });
  };
  
  const retrievePropertyTypes = () => {
    hostDataService.getPropertyTypes()
    .then(response => {
      console.log(response.data);
      setPropertyTypes(["All Type of Apartments"].concat(response.data));
    })
    .catch(e => {
      console.log(e);
    });
  };

  const refreshList = () => {
    retrieveHosts();
  }

  const find = (query) => {
    hostDataService.find(query)
    .then(response => {
      console.log(response.data);
      setHosts(response.data.hosts);
    })
    .catch(e => {
      console.log(e);
    });
  };

  const findAllProperties = () => {
    var query = "";
    if(searchName) {
      var l = "name=" + searchName + "&";
      query = query + l;
    }
    if(searchCountry) {
      var m = "country=" + searchCountry + "&";
      query = query + m;
    }
    if(searchPropertyType) {
      if(searchPropertyType === "All Type of Apartments"){
        console.log("All app");
      }
      else{ 
       var n = "property_type=" + searchPropertyType + "&";
       query = query + n;
      }
    }
    find(query)
  };

  const findByName = () => {
    find(searchName, "name")
  };

  const findByCountry = () => {
    find(searchCountry, "country")
  };

  const findByProprtyType = () => {
    if(searchPropertyType === "All Properties"){
      refreshList();
    } else {
      find(searchPropertyType, "property_type")
    }
  };

  return (
    <div>
  
      <div className="row pb-3">
        <div className = "input-group col-lg">
          <input
            type = "text"
            className = "form-control"
            placeholder = "Search by name"
            value = {searchName}
            onChange = {onChangeSearchName}
            />
        </div>

        <div className = "input-group col-lg">
          <input
            type = "text"
            className = "form-control"
            placeholder = "Search by country"
            value = {searchCountry}
            onChange = {onChangeSearchCountry}
            />
        </div>

        <div className = "input-group col-lg">
          <select onChange={onChangeSearchPropertyType} className = "col">
            {propertyTypes.map(propertyType => {
              return (
                <option value = {propertyType}> {propertyType.substr(0, 20)} </option>
              )
            })}
          </select>
          <div className="input-group-append">
            <button
              className = "btn btn-outline-secondary"
              type = "button"
              onClick = {findAllProperties}
              >
                Search
              </button>
          </div>
        </div>

      </div>

      <div className="row">
        {hosts.map((host) => {
          const address = `${host.address.street} ${host.address.suburb} ${host.address.government_area} ${host.address.country}`
          /*return (
            <div className="col-lg-4 pb-1">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{host.name}</h5>
                  <p className="card-text">
                    <strong>Property Type: </strong> {host.property_type}<br/>
                    <strong>Address: </strong> {address}
                  </p>
                  <div className="row">
                    <Link to={"/hosts/" + host._id} className = "btn btn-primary col-lg-5 mx-1 mb-1">
                      View Reviews
                    </Link>
                    <a target="_blank" href={"https://www.google.com/maps/place/" + host.address.location.coordinates.reverse()} className = "btn btn-primary col-lg-5 mx-1 mb-1">View Maps</a>
                  </div>
                </div>
              </div>
            </div>
          ); */

          return (
            <div className="col-lg-4 pb-1">
            <div className="card">
            <img src={host.images.picture_url} class="card-img-top img-fluid" alt="..." className="photo"/>  
              <div className="card-body">
                <h5 className="card-title">{host.name}</h5>
                <p className="card-text">{address}</p>
              </div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item"><strong>Property Type: </strong>{host.property_type}</li>
                <li className="list-group-item"><strong>Bedrooms: </strong>{host.bedrooms}</li>
              </ul>
              <div class="card-body">
                <div className="row">
                    <Link to={"/hosts/" + host._id} className = "btn btn-primary col-lg-5 mx-1 mb-1">
                      View Reviews
                    </Link>
                    <a target="_blank" href={"https://www.google.com/maps/place/" + host.address.location.coordinates.reverse()} className = "btn btn-primary col-lg-5 mx-1 mb-1">View Maps</a>
                </div>
              </div>
            </div>
            </div>
          );
        })}
      </div>

    </div>
  );


};

export default HostsList;