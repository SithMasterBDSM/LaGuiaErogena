//= VARIABLES GLOBALES ==============================================
// Acceso a colecciones de la base de datos (comunes a cliente y a servidor)
if ( Meteor.isServer ) {
    console.log("Starting MongoDB data access...");
}

marketingCampaign = new Mongo.Collection("marketingCampaign");
marketingTrackingReport = new Mongo.Collection("marketingTrackingReport");

var Schemas = {};

corporateEntity = new Mongo.Collection("corporateEntity");
Schemas.corporateEntity = new SimpleSchema({
    nameSpa: {
        type: String,
        label: "Nombre de la empresa / institución",
        max: 125
    },
    isOriginalLogoAllowed: {
        type: Boolean,
        label: "¿Se hace uso el uso del logotipo original de la empresa?"
    },
    originalLogoPath: {
        type: String,
        label: "Ruta del logotipo original"
    },
    alternateLogoPath: {
        type: String,
        label: "Ruta del logotipo alternativo"
    },

});
corporateEntity.attachSchema(Schemas.corporateEntity);

Schemas.location = new SimpleSchema({
    coordinates: {
        type: [Number],
        label: "Coordenadas",
        maxCount: 2,
        minCount: 2,
        decimal: true,
        autoform: {
            type: 'map',
            afFieldInput: {
                mapType: "roadmap",
                geolocation: true,
                searchBox: true,
                autolocate: true,
                zoom: 15,
                googleMap: {
                    key: "AIzaSyC4j3ixRQEbQx2K2tzs4kjsg-FJFznFS1A",
                },
                draggable: true,
                defaultLat: -74.0720919999999980,
                defaultLng: 4.7109885999999994,
                height: '400px'
            }
        }
    },
    type: {
        type: String,
        label: "Tipo",
        defaultValue: "Point"
    }
});

site = new Mongo.Collection("site");
Schemas.site = new SimpleSchema({
    nameSpa: {
        type: String,
        label: "Nombre del lugar / establecimiento",
        max: 250
    },
    location: {
        type: Schemas.location,
        label: "Localización",
        max: 50
    },
    address: {
        type: String,
        label: "Dirección",
        max: 250
    },
    idFinancialEntity: {
        type: String,
        label: "Nombre de la empresa que lo controla",
        max: 75
    },
    status: {
        type: String,
        label: "Estado",
        allowedValues: ["Funcionando", "En construcción", "Cerrado/inexistente"]
    },
    reference: {
        type: String,
        label: "Referencia / Información Adicional",
        max: 250,
        optional: true
    },
    geocoderObject: {
        type: Object,
        label: "Objeto del Geocodificador",
        optional: true
    }
});
site.attachSchema(Schemas.site);

corporateEntityLogos = new FS.Collection("corporateEntityLogos", {
    stores: [new FS.Store.GridFS("corporateEntityLogosStore")]
});

if ( Meteor.isServer ) {
    corporateEntityLogos.allow({
        download: function () {
            return true;
        },
        fetch: null
    });
}
