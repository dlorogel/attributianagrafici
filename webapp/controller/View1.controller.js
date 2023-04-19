sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "it/orogel/attributianagrafici/model/Constants",
    "it/orogel/attributianagrafici/model/xlsx",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Fragment, FilterOperator, Filter, MessageBox, MessageToast, Constants) {
        "use strict";

        const oAppController = Controller.extend("it.orogel.attributianagrafici.controller.View1", {
            onInit: function () {
                this.oComponent = this.getOwnerComponent();
                this.MapName = Constants.ZNAME_MAP;
                this.MapName1 = Constants.ZNAME_MAP1;
                this.MapName2 = Constants.ZNAME_MAP2;
                this.TableResult = [];
                this.CBO = [];
                this.RowInserted = [];
                this.RowModify = [];
                var ListaZattr = [];
                const oAppModel = this.getView().getModel("appModel");
                if (oAppModel) {
                    if (oAppModel.getProperty("/zattr") === undefined) {
                        this.MapName.forEach(x => {
                            var oZattr = {
                                "Value": x.VALUE
                            }
                            ListaZattr.push(oZattr);
                        });
                        oAppModel.setProperty("/zattr", ListaZattr);
                    }
                    ListaZattr = [];
                    if (oAppModel.getProperty("/zattr1") === undefined) {
                        this.MapName1.forEach(x => {
                            var oZattr1 = {
                                "Value": x.VALUE
                            }
                            ListaZattr.push(oZattr1);
                        });
                        oAppModel.setProperty("/zattr1", ListaZattr);
                    }
                    ListaZattr = [];
                    if (oAppModel.getProperty("/zattr2") === undefined) {
                        this.MapName2.forEach(x => {
                            var oZattr2 = {
                                "Value": x.VALUE
                            }
                            ListaZattr.push(oZattr2);
                        });
                        oAppModel.setProperty("/zattr2", ListaZattr);
                    }
                    if (oAppModel.getProperty("/zvalue") === undefined) {
                        const oPromiseAttributiAll = new Promise((resolve, reject) => {
                            this.getView().getModel().read("/ZMM_ATTR_HEADSet", {
                                success: (aData) => {
                                    resolve(aData.results);
                                },
                                error: (oError) => {
                                    reject;
                                }
                            });
                        });
                        const oPromiseDescrizioni = new Promise((resolve, reject) => {
                            this.getView().getModel().read("/ZMM_ATTR_DESCRSet", {
                                success: (aData) => {
                                    resolve(aData.results);
                                },
                                error: (oError) => {
                                    reject;
                                }
                            });
                        });
                        //oPromiseAttributiAll.then((aResults) => {
                        Promise.all([oPromiseAttributiAll, oPromiseDescrizioni]).then((aResults) => {
                            var ListaZvalue = [];
                            let aUniqueZvalue = [...new Set(aResults[0].map(item => item.Zvalue))];
                            aUniqueZvalue.forEach(x => {
                                var Find = aResults[0].find(y => y.Zvalue === x);
                                var Descrizione = "";
                                if (Find) {
                                    if (Find.ZdescrEst !== "") {
                                        Descrizione = Find.ZdescrEst;
                                    } else {
                                        Descrizione = Find.Zdescr;
                                    }
                                }
                                var oZvalue = {
                                    "Value": x,
                                    "Descrizione": Descrizione
                                }
                                ListaZvalue.push(oZvalue);
                            });
                            oAppModel.setProperty("/zvalue", ListaZvalue);
                            oAppModel.setProperty("/zdescr", aResults[1]);
                        }, oError => {
                            MessageToast.show(this.oComponent.i18n().getText("msg.error.zattributianagrafici.text"));
                            this.oComponent.resetAllBusy();
                        });
                    }
                }
            },
            onSelectAll: function () {
                const oAppModel = this.getView().getModel("appModel");
                var Seleziona = oAppModel.getProperty("/rows");
                Seleziona.forEach(x => {
                    x.Changed = this.byId("selectAllCheckBoxId").getSelected();
                });
                oAppModel.refresh(true);
            },
            onSearch: function () {
                this.oComponent.busy(true);
                this.TableResult = [];
                this.CBO = [];
                this.RowInserted = [];
                this.RowDeleted = [];
                this.RowModify = [];
                this.Item = [];
                this.NomeCampoInput = this.getView().byId("NomeCampoInput").getValue();
                this.ValoreCampoInput = this.getView().byId("ValoreCampoInput").getValue();
                this.CancellazioneInput = this.getView().byId("CancellazioneInput").getSelected();
                if (this.MapName.find(y => y.VALUE === this.NomeCampoInput) !== undefined) {
                    this.NomeCampoInput = this.MapName.find(y => y.VALUE === this.NomeCampoInput).KEY;
                }
                const oFinalFilter = new Filter({
                    filters: [],
                    and: true
                });
                if (this.NomeCampoInput !== undefined && this.NomeCampoInput !== "") {
                    let aNomeCampoFilter = [];
                    aNomeCampoFilter.push(new Filter("Zattr", FilterOperator.EQ, this.NomeCampoInput));
                    oFinalFilter.aFilters.push(new Filter({
                        filters: aNomeCampoFilter,
                        and: false
                    }));
                };
                if (this.ValoreCampoInput !== undefined && this.ValoreCampoInput !== "") {
                    let aValoreCampoFilter = [];
                    aValoreCampoFilter.push(new Filter("Zvalue", FilterOperator.EQ, this.ValoreCampoInput));
                    oFinalFilter.aFilters.push(new Filter({
                        filters: aValoreCampoFilter,
                        and: false
                    }));
                };
                let aCancellazioneFilter = [];
                if (this.CancellazioneInput === false) {
                    aCancellazioneFilter.push(new Filter("Zdel", FilterOperator.EQ, ""));
                    oFinalFilter.aFilters.push(new Filter({
                        filters: aCancellazioneFilter,
                        and: false
                    }));
                }
                if (this.DataDaInput !== undefined && this.DataDaInput !== "" && !(isNaN(this.DataDaInput))) {
                    let aDataDaInputFilter = [];
                    aDataDaInputFilter.push(new Filter("ZdatFrom", FilterOperator.GE, this.DataDaInput));
                    oFinalFilter.aFilters.push(new Filter({
                        filters: aDataDaInputFilter,
                        and: false
                    }));
                };
                if (this.DataAInput !== undefined && this.DataAInput !== "" && !(isNaN(this.DataAInput))) {
                    let aDataAInputFilter = [];
                    aDataAInputFilter.push(new Filter("ZdatTo", FilterOperator.LE, this.DataAInput));
                    oFinalFilter.aFilters.push(new Filter({
                        filters: aDataAInputFilter,
                        and: false
                    }));
                };
                const oPromiseAttributi = new Promise((resolve, reject) => {
                    this.getView().getModel().read("/ZMM_ATTR_HEADSet", {
                        filters: [oFinalFilter],
                        success: (aData) => {
                            resolve(aData.results);
                        },
                        error: (oError) => {
                            reject;
                        }
                    });
                });
                const oPromiseAttributiAll = new Promise((resolve, reject) => {
                    this.getView().getModel().read("/ZMM_ATTR_HEADSet", {
                        success: (aData) => {
                            resolve(aData.results);
                        },
                        error: (oError) => {
                            reject;
                        }
                    });
                });
                oPromiseAttributiAll.then((aResults) => {
                    aResults.forEach(x => {
                        if (this.MapName.find(y => y.KEY === x.Zattr) !== undefined) {
                            x.Zattr = this.MapName.find(y => y.KEY === x.Zattr).VALUE;
                        }
                    });
                    this.AllResult = aResults;
                }, oError => {
                    MessageToast.show(this.oComponent.i18n().getText("msg.error.zattributianagrafici.text"));
                    this.oComponent.resetAllBusy();
                });
                oPromiseAttributi.then((aResult) => {
                    this.oComponent.resetAllBusy();
                    aResult.forEach(x => {
                        if (this.MapName.find(y => y.KEY === x.Zattr) !== undefined) {
                            x.Zattr = this.MapName.find(y => y.KEY === x.Zattr).VALUE;
                        }
                        x.editable = false;
                        x.Changed = false;
                        if (x.Zdel === "") {
                            x.Zdel = false;
                        } else {
                            x.Zdel = true;
                        }
                        x.NewRow = false;
                        x.Specie = false;
                        this.CBO.push(JSON.parse(JSON.stringify(x)));
                    });
                    this._setTableModel(aResult);
                }, oError => {
                    MessageToast.show(this.oComponent.i18n().getText("msg.error.zattributianagrafici.text"));
                    this.oComponent.resetAllBusy();
                });
            },
            onReset: function () {
                this.getView().byId("NomeCampoInput").setValue("");
                this.getView().byId("ValoreCampoInput").setValue("");
                this.getView().byId("DataDaInput").setValue("");
                this.getView().byId("DataAInput").setValue("");
                this.getView().byId("CancellazioneInput").setSelected(false);
            },
            DataDaChange: function (oEvent) {
                this.DataDaInput = this.getView().byId("DataDaInput").getValue();
                var dateParts = this.DataDaInput.split(".");
                var date = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
                this.DataDaInput = new Date(date);
                let timezone = this.DataDaInput.getTimezoneOffset() / 60;
                this.DataDaInput.setHours(this.DataDaInput.getHours() - timezone);
            },
            DataAChange: function (oEvent) {
                this.DataAInput = this.getView().byId("DataAInput").getValue();
                var dateParts = this.DataAInput.split(".");
                var date = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
                this.DataAInput = new Date(date);
                let timezone = this.DataAInput.getTimezoneOffset() / 60;
                this.DataAInput.setHours(this.DataAInput.getHours() - timezone);
            },
            onInserisci: function () {
                var Datafine = new Date(9999, 11, 31);
                //let timezone = Datafine.getTimezoneOffset() / 60;
                //Datafine.setHours(Datafine.getHours() - timezone);
                let NewRow = {
                    "Zattr": "",
                    "Zvalue": "",
                    "ZdatFrom": null,
                    "ZdatTo": Datafine,
                    "Zdescr": "",
                    "ZdescrEst": "",
                    "Zfrove": "",
                    "Zdel": false,
                    "Ernam": "",
                    "Erdat": null,
                    "Zernam": "",
                    "Zerdat": null,
                    "editable": true,
                    "Changed": false,
                    "NewRow": true,
                    "Specie": false
                };
                //this.RowInserted.push(NewRow);
                this.RowInserted.unshift(NewRow);
                const oAppModel = this.getView().getModel("appModel");
                const oTable = this.getView().byId("attTableId");
                this._setTableModel([]);
                //this._setTableModel(this.TableResult.concat(this.RowInserted));
                this._setTableModel(this.RowInserted.concat(this.TableResult));
            },
            onModifica: function () {
                this.TableResult.forEach(x => {
                    if (x.Changed === true) {
                        x.editable = true;
                        if (x.Zattr === "Specie") {
                            x.Specie = true;
                        }
                    }
                });
                this._setTableModel([]);
                //this._setTableModel(this.TableResult.concat(this.RowInserted));
                this._setTableModel(this.RowInserted.concat(this.TableResult));
            },
            onCopiaTestata: function () {
                this.NomeCampoInput = this.getView().byId("NomeCampoInput").getValue();
                this.RowInserted.forEach(x => {
                    if (x.Zattr === "") {
                        x.Zattr = this.NomeCampoInput;
                        if (this.NomeCampoInput === "Specie") {
                            x.Specie = true;
                        }
                    }
                });
                this._setTableModel([]);
                this._setTableModel(this.RowInserted.concat(this.TableResult));
            },
            onElimina: function () {
                this.TableResult.concat(this.RowInserted).forEach(x => {
                    if (x.Changed === true) {
                        x.Zdel = true;
                    }
                });
                this._setTableModel([]);
                //this._setTableModel(this.TableResult.concat(this.RowInserted));
                this._setTableModel(this.RowInserted.concat(this.TableResult));
            },
            onRipristina: function () {
                this.TableResult.concat(this.RowInserted).forEach(x => {
                    if (x.Changed === true) {
                        x.Zdel = false;
                    }
                });
                this._setTableModel([]);
                //this._setTableModel(this.TableResult.concat(this.RowInserted));
                this._setTableModel(this.RowInserted.concat(this.TableResult));
            },
            onAnnulla: function () {
                this.RowInserted = [];
                for (var i = 0; i < this.TableResult.length; i++) {
                    this.TableResult[i].Zdel = this.CBO[i].Zdel;
                    this.TableResult[i].Zdescr = this.CBO[i].Zdescr;
                    this.TableResult[i].ZdescrEst = this.CBO[i].ZdescrEst;
                    this.TableResult[i].Zfrove = this.CBO[i].Zfrove;
                }
                this._setTableModel([]);
                this._setTableModel(this.TableResult);
            },
            onSalva: function () {
                this.RowDeleted = [];
                var Errore = "";
                Errore = this._controlloErrori(Errore);
                if (Errore === "") {
                    const oPromiseUpdate = new Promise((resolve, reject) => {
                        this.onSalvaUpdate(resolve, reject);
                    });
                    oPromiseUpdate.then(() => {
                        /*const oPromiseElimina = new Promise((resolve, reject) => {
                            this.onSalvaElimina(resolve, reject);
                        });
                        oPromiseElimina.then(() => {*/
                        const oPromiseInserisci = new Promise((resolve, reject) => {
                            this.onSalvaInserisci(resolve, reject);
                        });
                        oPromiseInserisci.then(() => {
                            this.onSearch();
                        }, oError => {
                            this.onSearch();
                        });
                        //}, oError => {
                        //});
                    }, oError => {
                        this.onSearch();
                    });
                } else {
                    MessageBox.error(Errore);
                }
            },
            onSalvaInserisci: function (resolve, reject) {
                var batchChanges = [];
                var sServiceUrl = "/sap/opu/odata/sap/ZATTRIBUTIANAGRAFICI_SRV/";
                var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
                if (this.RowInserted.length === 0) {
                    resolve();
                } else {
                    for (var i = 0; i < this.RowInserted.length; i++) {
                        if (this.RowInserted[i].Zdel === false) {
                            var oData = this.RowInserted[i];
                            let timezone = oData.ZdatFrom.getTimezoneOffset() / 60;
                            oData.ZdatFrom.setHours(oData.ZdatFrom.getHours() - timezone);
                            timezone = oData.ZdatTo.getTimezoneOffset() / 60;
                            oData.ZdatTo.setHours(oData.ZdatTo.getHours() - timezone);
                            delete oData.editable;
                            delete oData.NewRow;
                            delete oData.Changed;
                            delete oData.Specie;
                            oData.Zdel = "";
                            if (this.MapName.find(y => y.VALUE === oData.Zattr) !== undefined) {
                                oData.Zattr = this.MapName.find(y => y.VALUE === oData.Zattr).KEY;
                            }
                            batchChanges.push(oDataModel.createBatchOperation("ZMM_ATTR_HEADSet", "POST", oData));
                        }
                    }
                    if (batchChanges.length === 0) {
                        resolve();
                    }
                    oDataModel.addBatchChangeOperations(batchChanges);
                    oDataModel.submitBatch(function (data, responseProcess) {
                        var success = true;
                        if (data.hasOwnProperty('__batchResponses')) {
                            if (data.__batchResponses[0].hasOwnProperty('__changeResponses')) {
                                data.__batchResponses[0].__changeResponses.forEach(z => {
                                    if (z.statusCode === "400") {
                                        success = false;
                                    }
                                });
                            }
                        }
                        if (success === true) {
                            sap.m.MessageToast.show("Successo");
                            resolve();
                        } else {
                            sap.m.MessageToast.show("Errore");
                            reject();
                        }
                    }.bind(this),
                        function (err) {
                            sap.m.MessageToast.show("Errore");
                            reject();
                        });
                }
            },
            /*onSalvaElimina: function (resolve, reject) {
                var batchChanges = [];
                var sServiceUrl = "/sap/opu/odata/sap/ZATTRIBUTIANAGRAFICI_SRV/";
                var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
                if (this.RowDeleted.length === 0) {
                    resolve();
                } else {
                    this.RowDeleted.forEach(x => {
                        var DeleteString = "ZMM_ATTR_HEADSet(Zattr='" + x.Zattr + "',Zvalue='" + x.Zvalue + "',Zver='" + x.Zver + "')";
                        batchChanges.push(oDataModel.createBatchOperation(DeleteString, "DELETE"));
                    });
                    oDataModel.addBatchChangeOperations(batchChanges);
                    oDataModel.submitBatch(function (data, responseProcess) {
                        sap.m.MessageToast.show("Successo");
                        resolve();
                    }.bind(this),
                        function (err) {
                            sap.m.MessageToast.show("Errore");
                            reject();
                        });
                }
            },*/
            onSalvaUpdate: function (resolve, reject) {
                var batchChanges = [];
                var sServiceUrl = "/sap/opu/odata/sap/ZATTRIBUTIANAGRAFICI_SRV/";
                var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
                if (this.RowModify.length === 0) {
                    resolve();
                } else {
                    this.RowModify.forEach(x => {
                        if (this.MapName.find(y => y.VALUE === x.Zattr) !== undefined) {
                            x.Zattr = this.MapName.find(y => y.VALUE === x.Zattr).KEY;
                        }
                        //var DataFrom = x.ZdatFrom.toISOString().split('T')[0];
                        //DataFrom=DataFrom.replaceAll("-", "");
                        //var DataTo = x.ZdatTo.toISOString().split('T')[0];
                        //DataTo=DataTo.replaceAll("-", "");
                        var DataFrom = sap.ui.model.odata.ODataUtils.formatValue(new Date(x.ZdatFrom), "Edm.DateTime");
                        var DataTo = sap.ui.model.odata.ODataUtils.formatValue(new Date(x.ZdatTo), "Edm.DateTime");
                        var ModifyString = "ZMM_ATTR_HEADSet(Zattr='" + x.Zattr + "',Zvalue='" + x.Zvalue + "',ZdatFrom=" + DataFrom + ",ZdatTo=" + DataTo + ")";
                        batchChanges.push(oDataModel.createBatchOperation(encodeURIComponent(ModifyString), "PATCH", x));
                    });
                    oDataModel.addBatchChangeOperations(batchChanges);
                    oDataModel.submitBatch(function (data, responseProcess) {
                        sap.m.MessageToast.show("Successo");
                        resolve();
                    }.bind(this),
                        function (err) {
                            sap.m.MessageToast.show("Errore");
                            reject();
                        });
                }
            },
            onChangeDescrizione: function (oEvent) {
                var index = oEvent.getSource().getParent().getIndex();
                var header = this.getView().byId("attTableId").getContextByIndex(index).getObject();
                header.ZdescrEst = header.Zdescr;
            },
            onNavToPos1: function (oEvent) {
                var index = oEvent.getSource().getParent().getIndex();
                var header = this.getView().byId("attTableId").getContextByIndex(index).getObject();
                this.getOwnerComponent().setHeader(header);
                this.getOwnerComponent().getRouter().navTo("RouteView2");
            },
            onZattrVHRequest: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue(),
                    oView = this.getView();
                this.IndiceValueHelp = oEvent.getSource().getParent().getIndex();
                // create value help dialog
                this._pValueHelpDialog = Fragment.load({
                    id: "Zattr",
                    name: "it.orogel.attributianagrafici.view.VHDialogZattr",
                    controller: this
                }).then(function (oValueHelpDialog) {
                    oView.addDependent(oValueHelpDialog);
                    return oValueHelpDialog;
                });
                this._pValueHelpDialog.then(function (oValueHelpDialog) {
                    oValueHelpDialog.open(sInputValue);
                });
            }, onSearchZattr: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter({
                    filters: [
                        new Filter("Value", FilterOperator.Contains, sValue),
                    ],
                    and: false
                });
                var oBinding = oEvent.getParameter("itemsBinding");
                oBinding.filter([oFilter]);
            }, onSearchZvalue: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter({
                    filters: [
                        new Filter("Value", FilterOperator.Contains, sValue),
                        new Filter("Descrizione", FilterOperator.Contains, sValue),
                    ],
                    and: false
                });
                var oBinding = oEvent.getParameter("itemsBinding");
                oBinding.filter([oFilter]);
            }, onVHDialogZattrClose: function (oEvent) {
                var aSelectedItems = oEvent.getParameter("selectedItems");
                if (aSelectedItems && aSelectedItems.length > 0) {
                    var oSelected = this.getView().byId("attTableId").getContextByIndex(this.IndiceValueHelp).getObject();
                    oSelected.Zattr = aSelectedItems[0].getTitle();
                    if (aSelectedItems[0].getTitle() === "Specie") {
                        oSelected.Specie = true;
                    } else {
                        oSelected.Specie = false;
                        oSelected.Zfrove = "";
                    }
                    this._setTableModel([]);
                    //this._setTableModel(this.TableResult.concat(this.RowInserted));
                    this._setTableModel(this.RowInserted.concat(this.TableResult));
                }
            },
            onZattrVHRequestFilter: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue(),
                    oView = this.getView();
                // create value help dialog
                this._pValueHelpDialog = Fragment.load({
                    id: "Zattr",
                    name: "it.orogel.attributianagrafici.view.VHDialogZattrFilter",
                    controller: this
                }).then(function (oValueHelpDialog) {
                    oView.addDependent(oValueHelpDialog);
                    return oValueHelpDialog;
                });
                this._pValueHelpDialog.then(function (oValueHelpDialog) {
                    oValueHelpDialog.open(sInputValue);
                });
            }, onVHDialogZattrCloseFilter: function (oEvent) {
                var aSelectedItems = oEvent.getParameter("selectedItems");
                if (aSelectedItems && aSelectedItems.length > 0) {
                    this.getView().byId("NomeCampoInput").setValue(aSelectedItems[0].getTitle());
                }
            },
            onZvalueVHRequestFilter: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue(),
                    oView = this.getView();
                // create value help dialog
                this._pValueHelpDialog = Fragment.load({
                    id: "Zvalue",
                    name: "it.orogel.attributianagrafici.view.VHDialogZvalueFilter",
                    controller: this
                }).then(function (oValueHelpDialog) {
                    oView.addDependent(oValueHelpDialog);
                    return oValueHelpDialog;
                });
                this._pValueHelpDialog.then(function (oValueHelpDialog) {
                    oValueHelpDialog.getBinding("items").filter([new Filter("Value", FilterOperator.Contains, sInputValue)]);
                    oValueHelpDialog.open(sInputValue);
                });
            }, onVHDialogZvalueCloseFilter: function (oEvent) {
                var aSelectedItems = oEvent.getParameter("selectedItems");
                if (aSelectedItems && aSelectedItems.length > 0) {
                    var aSelezionato = aSelectedItems[0].getTitle().split(" | ");
                    this.getView().byId("ValoreCampoInput").setValue(aSelezionato[0]);
                }
            },
            onExportToExcel: function (oEvent) {
                /*global XLSX*/
                const oDataExcel = [];
                this.TableResult.forEach(y => {
                    var del = "";
                    if (y.Zdel === true) {
                        del = "X";
                    }
                    var oAttributo = {
                        "Nome Attributo": y.Zattr,
                        "Voce Attributo": y.Zvalue,
                        "Data Inizio Validita": y.ZdatFrom,
                        "Data Fine Validita": y.ZdatTo,
                        "Descrizione Attributo": y.Zdescr,
                        "Descrizione Estesa Attributo": y.ZdescrEst,
                        "Frutta/Verdura": y.Zfrove,
                        "Cancellazione": del,
                        "Creato Da": y.Ernam,
                        "Data Creazione": y.Erdat,
                        "Modificato Da": y.Zernam,
                        "Data Modifica": y.Zerdat,
                    };
                    oDataExcel.push(oAttributo);
                });
                let wb = XLSX.utils.book_new();
                let ws = XLSX.utils.json_to_sheet(oDataExcel);
                var wscols = [{
                    wch: 20
                }, {
                    wch: 20
                }, {
                    wch: 20
                }, {
                    wch: 20
                }, {
                    wch: 20
                }, {
                    wch: 20
                }, {
                    wch: 20
                }, {
                    wch: 20
                }, {
                    wch: 20
                }, {
                    wch: 20
                }, {
                    wch: 20
                }];
                ws['!cols'] = wscols;
                XLSX.utils.book_append_sheet(wb, ws, "Attributi");
                XLSX.writeFile(wb, this.getView().getModel("i18n").getResourceBundle().getText("title") + ".xlsx");
            }
        });

        /**
        * Set table model 
        * ---------------
        * @param aProducts - products
        * @private
        */
        oAppController.prototype._setTableModel = function (aResults) {
            if (this.TableResult.length === 0 && this.RowInserted.length === 0) {
                this.TableResult = aResults;
            }
            //set model: concat new batch of data to previous model
            const oAppModel = this.getView().getModel("appModel");
            const oTable = this.getView().byId("attTableId");
            oAppModel.setProperty("/rows", aResults);
            oTable.setModel(oAppModel);
            oTable.bindRows("/rows");
            //oTable.getColumns().map((col, index) => {
            //    if (index !== 1) oTable.autoResizeColumn(index)
            //});
            oTable.sort(oTable.getColumns()[0]);
            oAppModel.refresh(true);
            this.oComponent.resetAllBusy();
        };
        oAppController.prototype._controlloErrori = function (Errori) {
            const oAppModel = this.getView().getModel("appModel");
            var MapDescrizione = oAppModel.getProperty("/zdescr");
            this.RowInserted.forEach(x => {
                x.Zvalue=x.Zvalue.toUpperCase();
                if (x.Zattr === "" || x.ZdatFrom === "" || x.ZdatTo === "" || x.ZdatFrom === null || x.ZdatTo === null || x.Zvalue === "") {
                    Errori = Errori + "Valorizzare i campi obbligatori\n";
                }
                if (x.Zattr === "Specie") {
                    if (x.Zfrove !== "F" && x.Zfrove !== "V") {
                        Errori = Errori + "Valorizzare il campo Frutta/Verdura\n";
                    }
                }
                var ZattrKey = "";
                if (this.MapName.find(y => y.VALUE === x.Zattr) !== undefined) {
                    ZattrKey = this.MapName.find(y => y.VALUE === x.Zattr).KEY;
                }
                if (MapDescrizione.find(y => y.Zattr === ZattrKey) !== undefined) {
                    if (MapDescrizione.find(y => y.Zattr === ZattrKey).Zlung < x.Zdescr.length) {
                        Errori = Errori + "Descrizione breve non ammessa perchè troppo lunga per " + x.Zattr + " " + x.Zvalue + " " + x.ZdatFrom + " " + x.ZdatTo + ".Il numero massimo di caratteri  è" + MapDescrizione.find(y => y.Zattr === ZattrKey).Zlung + "\n";
                    }
                }
                if (this.MapName.find(y => y.VALUE === x.Zattr) !== undefined) {
                    /*if (this.MapName.find(y => y.VALUE === x.Zattr).LENGTH < x.Zvalue.length) {
                        Errori = Errori + "Valore non ammesso perchè troppo lungo per " + x.Zattr + " " + x.Zvalue + " " + x.ZdatFrom + " " + x.ZdatTo + "\n";
                    }*/
                    if (this.MapName.find(y => y.VALUE === x.Zattr).LENGTH !== x.Zvalue.length) {
                        Errori = Errori + "Il codice inserito non è della lunghezza corretta per " + x.Zattr + " " + x.Zvalue + " " + x.ZdatFrom + " " + x.ZdatTo + "\n";
                    }
                }
                if (x.ZdatFrom > x.ZdatTo) {
                    Errori = Errori + "Data inizio validità > Data fine validità per " + x.Zattr + " " + x.Zvalue + " " + x.ZdatFrom + " " + x.ZdatTo + "\n";
                }
                if (this.AllResult !== undefined) {
                    var ControlFrom = new Date(x.ZdatFrom);
                    var ControlTo = new Date(x.ZdatTo);
                    let timezone = ControlFrom.getTimezoneOffset() / 60;
                    ControlFrom.setHours(ControlFrom.getHours() - timezone);
                    timezone = ControlTo.getTimezoneOffset() / 60;
                    ControlTo.setHours(ControlTo.getHours() - timezone);
                    var find = this.AllResult.find(y => y.Zattr === x.Zattr && y.Zvalue === x.Zvalue && y.ZdatFrom.getTime() === ControlFrom.getTime() && y.ZdatTo.getTime() === ControlTo.getTime());
                    if (find !== undefined) {
                        Errori = Errori + "Chiave già esistente a sistema: " + x.Zattr + " " + x.Zvalue + " " + x.ZdatFrom + " " + x.ZdatTo + "\n";
                    }
                }
            });
            if (Errori === "") {
                for (var i = 0; i < this.TableResult.length; i++) {
                    if (this.TableResult[i].Zdel === true) {
                        this.TableResult[i].Zdel = "X";
                    } else if (this.TableResult[i].Zdel === false) {
                        this.TableResult[i].Zdel = "";
                    }
                    delete this.TableResult[i].editable;
                    delete this.TableResult[i].NewRow;
                    delete this.TableResult[i].Changed;
                    delete this.TableResult[i].Specie;
                    if (this.CBO[i].Zdel === false) {
                        this.CBO[i].Zdel = "";
                    } else if (this.CBO[i].Zdel === true) {
                        this.CBO[i].Zdel = "X";
                    }
                    delete this.CBO[i].editable;
                    delete this.CBO[i].NewRow;
                    delete this.CBO[i].Changed;
                    delete this.CBO[i].Specie;
                    if (JSON.stringify(this.TableResult[i]) !== JSON.stringify(this.CBO[i])) {
                        this.RowModify.push(this.TableResult[i]);
                    }
                }
            }
            return Errori;
        };
        return oAppController;
    });
