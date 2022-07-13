sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "it/orogel/attributianagrafici/model/Constants"
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
                this.TableResult = [];
                this.CBO = [];
                this.RowInserted = [];
                this.RowModify = [];
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
                        this.CBO.push(JSON.parse(JSON.stringify(x)));
                    });
                    this._setTableModel(aResult);
                }, oError => {
                    MessageToast.show(this.oComponent.i18n().getText("msg.error.zattributianagrafici.text"));
                    this.oComponent.resetAllBusy();
                });
            },
            DataDaChange: function (oEvent) {
                this.DataDaInput = this.getView().byId("DataDaInput").getValue();
                this.DataDaInput = new Date(this.DataDaInput);
                let timezone = this.DataDaInput.getTimezoneOffset() / 60;
                this.DataDaInput.setHours(this.DataDaInput.getHours() - timezone);
            },
            DataAChange: function (oEvent) {
                this.DataAInput = this.getView().byId("DataAInput").getValue();
                this.DataAInput = new Date(this.DataAInput);
                let timezone = this.DataAInput.getTimezoneOffset() / 60;
                this.DataAInput.setHours(this.DataAInput.getHours() - timezone);
            },
            onInserisci: function () {
                let NewRow = {
                    "Zattr": "",
                    "Zvalue": "",
                    "ZdatFrom": null,
                    "ZdatTo": null,
                    "Zdescr": "",
                    "Zdel": false,
                    "Ernam": "",
                    "Erdat": null,
                    "Zernam": "",
                    "Zerdat": null,
                    "editable": true,
                    "Changed": false,
                    "NewRow": true
                };
                this.RowInserted.push(NewRow);
                const oAppModel = this.getView().getModel("appModel");
                const oTable = this.getView().byId("attTableId");
                this._setTableModel([]);
                this._setTableModel(this.TableResult.concat(this.RowInserted));
            },
            onModifica: function () {
                this.TableResult.forEach(x => {
                    if (x.Changed === true) {
                        x.editable = true;
                    }
                });
                this._setTableModel([]);
                this._setTableModel(this.TableResult.concat(this.RowInserted));
            },

            onElimina: function () {
                this.TableResult.concat(this.RowInserted).forEach(x => {
                    if (x.Changed === true) {
                        x.Zdel = true;
                    }
                });
                this._setTableModel([]);
                this._setTableModel(this.TableResult.concat(this.RowInserted));
            },
            onRipristina: function () {
                this.TableResult.concat(this.RowInserted).forEach(x => {
                    if (x.Changed === true) {
                        x.Zdel = false;
                    }
                });
                this._setTableModel([]);
                this._setTableModel(this.TableResult.concat(this.RowInserted));
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
                            delete oData.editable;
                            delete oData.NewRow;
                            delete oData.Changed;
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
                        sap.m.MessageToast.show("Successo");
                        resolve();
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
                        var DataFrom=sap.ui.model.odata.ODataUtils.formatValue(new Date(x.ZdatFrom), "Edm.DateTime");
                        var DataTo=sap.ui.model.odata.ODataUtils.formatValue(new Date(x.ZdatTo), "Edm.DateTime");
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
            onNavToPos1: function (oEvent) {
                var index = oEvent.getSource().getParent().getIndex();
                var header = this.getView().byId("attTableId").getContextByIndex(index).getObject();
                this.getOwnerComponent().setHeader(header);
                this.getOwnerComponent().getRouter().navTo("RouteView2");
            }, onZattrVHRequest: function (oEvent) {
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
                        new Filter("Zattr", FilterOperator.Contains, sValue),
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
                    this._setTableModel([]);
                    this._setTableModel(this.TableResult.concat(this.RowInserted));
                }
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
            var ListaZattr = [];
            if (oAppModel.getProperty("/zattr") === undefined) {
                this.MapName.forEach(x => {
                    var oZattr = {
                        "Value": x.VALUE
                    }
                    ListaZattr.push(oZattr);
                });
                oAppModel.setProperty("/zattr", ListaZattr);
            }
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
            this.RowInserted.forEach(x => {
                if (x.Zattr === "" || x.ZdatFrom === "" || x.ZdatTo === "" || x.ZdatFrom === null || x.ZdatTo === null || x.Zvalue === "") {
                    Errori = Errori + "Valorizzare i campi obbligatori\n";
                }
                if (this.MapName.find(y => y.VALUE === x.Zattr) !== undefined) {
                    if (this.MapName.find(y => y.VALUE === x.Zattr).LENGTH < x.Zvalue.length) {
                        Errori = Errori + "Valore non ammesso perchè troppo lungo per " + x.Zattr + " " + x.Zvalue + " " + x.ZdatFrom + " " + x.ZdatTo + "\n";
                    }
                }
                if (x.ZdatFrom > x.ZdatTo) {
                    Errori = Errori + "Data inizio validità > Data fine validità per " + x.Zattr + " " + x.Zvalue + " " + x.ZdatFrom + " " + x.ZdatTo + "\n";
                }
                var find = this.AllResult.find(y => y.Zattr === x.Zattr && y.Zvalue === x.Zvalue && y.ZdatFrom === x.ZdatFrom && y.ZdatTo === x.ZdatTo);
                if (find !== undefined) {
                    Errori = Errori + "Chiave già esistente a sistema: " + x.Zattr + " " + x.Zvalue + " " + x.ZdatFrom + " " + x.ZdatTo + "\n";
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
                    if (this.CBO[i].Zdel === false) {
                        this.CBO[i].Zdel = "";
                    } else if (this.CBO[i].Zdel === true) {
                        this.CBO[i].Zdel = "X";
                    }
                    delete this.CBO[i].editable;
                    delete this.CBO[i].NewRow;
                    delete this.CBO[i].Changed;
                    if (JSON.stringify(this.TableResult[i]) !== JSON.stringify(this.CBO[i])) {
                        this.RowModify.push(this.TableResult[i]);
                    }
                }
            }
            return Errori;
        };
        return oAppController;
    });
