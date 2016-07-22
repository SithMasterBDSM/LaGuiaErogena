valid = function (value) {
    return (typeof value != "undefined") && (value != null);
}

titleCase = function (str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
}

isLocatedInBogota = function (result) {
    var geocode = false;
    for (var i = 0; i < result.address_components.length; i++) {
        if ( result.address_components[i].long_name.toLowerCase() == "bogotá" || result.address_components[i].long_name.toLowerCase() == "bogota" ) {
            geocode = result;
            break;
        }
    }
    return geocode;
}
