/*
 * © 2020 - Deloitte
 */
sap.ui.define([], function () {
    "use strict";

    return {
        ZNAME_MAP: [{
            KEY: "SPECIE",
            VALUE: "Specie",
            LENGTH: 3
        }, {
            KEY: "STAGIONALITA",
            VALUE: "Stagionalità",
            LENGTH: 1
        }, /*{
            KEY: "VARIETA",
            VALUE: "Varietà",
            LENGTH: "3"
        }, */{
            KEY: "RAGG_VARIET",
            VALUE: "Raggruppamento varietà",
            LENGTH: 4
        }, {
            KEY: "CERTIFICAZIONE_AZIENDALE",
            VALUE: "Certificazione aziendale",
            LENGTH: 1
        }, {
            KEY: "CERTIFICAZIONE_PRODOTTO",
            VALUE: "Certificazione prodotto",
            LENGTH: 1
        }, {
            KEY: "RESIDUO",
            VALUE: "Residuo",
            LENGTH: 1
        }, {
            KEY: "CERTIFICAZIONE_COMMERCIALE",
            VALUE: "Certificazione commerciale",
            LENGTH: 2
        }, /*{
            KEY: "SPECIFICA",
            VALUE: "Specifica",
            LENGTH: "1"
        },*//*{
            KEY: "LAVORAZIONE",
            VALUE: "Lavorazione",
            LENGTH: "2"
        }, */{
            KEY: "ORIGINE",
            VALUE: "Origine",
            LENGTH: 2
        }, /*{
            KEY: "QUALITA",
            VALUE: "Qualità",
            LENGTH: "2"
        }, *//*{
            KEY: "CALIBRAZ",
            VALUE: "Calibrazione",
            LENGTH: "2"
        }, {
            KEY: "RAGGCALIBR",
            VALUE: "Raggruppatore Calibrazione",
            LENGTH: "2"
        },*/
        {
            KEY: "RAGGCALIBR",
            VALUE: "Calibrazione",
            LENGTH: 2
        },
        {
            KEY: "EVENTI",
            VALUE: "Eventi Coltivazione",
            LENGTH: 1
        }, {
            KEY: "CAR_RACTAG",
            VALUE: "Caratteristica di raccolta e taglio",
            LENGTH: 1
        }, {
            KEY: "SERVIZIO1",
            VALUE: "Servizio raccolta/taglio",
            LENGTH: 1
        }, {
            KEY: "SERVIZIO2",
            VALUE: "Servizio assistenza tecnica",
            LENGTH: 1
        }, {
            KEY: "SERVIZIO3",
            VALUE: "Servizio carico automezzi",
            LENGTH: 1
        }, {
            KEY: "SERVIZIO4",
            VALUE: "Servizio di deposito",
            LENGTH: 1
        }, {
            KEY: "SERVIZIO5",
            VALUE: "Servizio di calibrazione",
            LENGTH: 1
        }, {
            KEY: "SERVIZIOEXTRA1",
            VALUE: "Servizio extra1",
            LENGTH: 1
        }, {
            KEY: "SERVIZIOEXTRA2",
            VALUE: "Servizio extra2",
            LENGTH: 1
        }, {
            KEY: "SERVIZIOEXTRA3",
            VALUE: "Servizio extra3",
            LENGTH: 1
        }, {
            KEY: "SERVIZIOEXTRA4",
            VALUE: "Servizio extra4",
            LENGTH: 1
        }, {
            KEY: "SERVIZIOEXTRA5",
            VALUE: "Servizio extra5",
            LENGTH: 1
        }, {
            KEY: "RAGGLIQ",
            VALUE: "Raggruppamento di liquidazione",
            LENGTH: 4
        }, {
            KEY: "TRATTA",
            VALUE: "Zona di trasporto",
            LENGTH: 3
        }, {
            KEY: "POLITICHEOP",
            VALUE: "Campo politiche OP",
            LENGTH: 3
        }],
        ZNAME_MAP1: [{
            KEY: "VARIETA",
            VALUE: "Varietà",
            LENGTH: 3
        }, {
            KEY: "SPECIFICA",
            VALUE: "Specifica",
            LENGTH: 1
        }, {
            KEY: "LAVORAZIONE",
            VALUE: "Lavorazione",
            LENGTH: 2
        }, {
            KEY: "QUALITA",
            VALUE: "Qualità",
            LENGTH: 2
        },
        /*{
            KEY: "CALIBRAZ",
            VALUE: "Calibrazione",
            LENGTH: "2"
        },*/
        {
            KEY: "CALIBRAZ",
            VALUE: "Dettaglio di Calibrazione",
            LENGTH: 2
        },
        /*{
            KEY: "RAGGCALIBR",
            VALUE: "Raggruppatore Calibrazione",
            LENGTH: "2"
        },
        */
        {
            KEY: "RAGGCALIBR",
            VALUE: "Calibrazione",
            LENGTH: 2
        },
        {
            KEY: "RAGG_VARIET",
            VALUE: "Raggruppamento varietà",
            LENGTH: 4
        }],
        ZNAME_MAP2: [
            /*{
            KEY: "RAGGCALIBR",
            VALUE: "Raggruppatore Calibrazione",
            LENGTH: "2"
        },*/
            {
                KEY: "RAGGCALIBR",
                VALUE: "Calibrazione",
                LENGTH: 2
            }, {
                KEY: "RAGG_VARIET",
                VALUE: "Raggruppamento varietà",
                LENGTH: 4
            }],
        Style: {
            // Stile riga Intestazione
            HEADER: {
                font: {
                    bold: true,
                    name: "Calibri",
                    sz: 10
                },
                border: {
                    bottom: {
                        style: "thin"
                    }
                },
                alignment: {
                    horizontal: "center"
                }
            },
        }
    };
});