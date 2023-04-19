sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History",
    "it/orogel/attributianagrafici/model/Constants",
    "it/orogel/attributianagrafici/model/xlsx"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Fragment, FilterOperator, Filter, MessageBox, MessageToast, History, Constants) {
        "use strict";

        const oAppController = Controller.extend("it.orogel.attributianagrafici.controller.Pos2", {
            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("RouteView3").attachPatternMatched(this._onObjectMatched, this);
                this.oComponent = this.getOwnerComponent();
            },
            onSelectAll: function () {
                const oAppModel = this.getView().getModel("appModel");
                var Seleziona = oAppModel.getProperty("/rows2");
                Seleziona.forEach(x => {
                    x.Changed = this.byId("selectAllCheckBoxId").getSelected();
                });
                oAppModel.refresh(true);
            },
            _onObjectMatched: function (oEvent) {
                this.oComponent.busy(true);
                const oAppModel = this.getView().getModel("appModel");
                this.TableResultPos2 = [];
                this.CBOPos2 = [];
                var ListaZattr = [];
                this.RowInsertedPos2 = [];
                this.RowModifyPos2 = [];
                this.MapName = Constants.ZNAME_MAP;
                this.MapName1 = Constants.ZNAME_MAP1;
                this.MapName2 = Constants.ZNAME_MAP2;
                this.Pos1 = this.getOwnerComponent().getPos1();
                this.getView().byId("NomeCampoInput").setValue(this.Pos1.Zname);
                this.getView().byId("ValoreCampoInput").setValue(this.Pos1.ZvalueInf);
                this.getView().byId("DescrizioneCampoInput").setValue(this.Pos1.Zdescr);
                const oFinalFilter = new Filter({
                    filters: [],
                    and: true
                });
                var filterzname = this.Pos1.Zname;
                if (this.MapName1.find(y => y.VALUE === this.Pos1.Zname) !== undefined) {
                    filterzname = this.MapName1.find(y => y.VALUE === this.Pos1.Zname).KEY;
                }
                var filterznamehead = this.Pos1.Zattr;
                if (this.MapName.find(y => y.VALUE === this.Pos1.Zattr) !== undefined) {
                    filterznamehead = this.MapName.find(y => y.VALUE === this.Pos1.Zattr).KEY;
                }
                let aNomeCampoFilter = [];
                aNomeCampoFilter.push(new Filter("Zattr", FilterOperator.EQ, filterzname));
                oFinalFilter.aFilters.push(new Filter({
                    filters: aNomeCampoFilter,
                    and: false
                }));
                let aValoreCampoFilter = [];
                aValoreCampoFilter.push(new Filter("Zvalue", FilterOperator.EQ, this.Pos1.ZvalueInf));
                oFinalFilter.aFilters.push(new Filter({
                    filters: aValoreCampoFilter,
                    and: false
                }));
                let aNomeCampoPadreFilter = [];
                aNomeCampoPadreFilter.push(new Filter("ZattrHead", FilterOperator.EQ, filterznamehead));
                oFinalFilter.aFilters.push(new Filter({
                    filters: aNomeCampoPadreFilter,
                    and: false
                }));
                let aValoreCampoPadreFilter = [];
                aValoreCampoPadreFilter.push(new Filter("ZvalueHead", FilterOperator.EQ, this.Pos1.Zvalue));
                oFinalFilter.aFilters.push(new Filter({
                    filters: aValoreCampoPadreFilter,
                    and: false
                }));
                const oPromiseAttributi = new Promise((resolve, reject) => {
                    this.getView().getModel().read("/ZMM_ATTR_POS2Set", {
                        filters: [oFinalFilter],
                        success: (aData) => {
                            resolve(aData.results);
                        },
                        error: (oError) => {
                            reject;
                        }
                    });
                });
                oPromiseAttributi.then((aResult) => {
                    this.oComponent.resetAllBusy();
                    aResult.forEach(x => {
                        x.ZattrHead = this.Pos1.Zattr;
                        x.ZvalueHead = this.Pos1.Zvalue;
                        x.Zattr = this.Pos1.Zname;
                        x.Zvalue = this.Pos1.ZvalueInf;
                        if (this.MapName1.find(y => y.KEY === x.Zattr) !== undefined) {
                            x.Zattr = this.MapName1.find(y => y.KEY === x.Zattr).VALUE;
                        }
                        if (this.MapName2.find(y => y.KEY === x.Zname) !== undefined) {
                            x.Zname = this.MapName1.find(y => y.KEY === x.Zname).VALUE;
                        }
                        if (this.MapName.find(y => y.KEY === x.ZattrHead) !== undefined) {
                            x.Zattr = this.MapName.find(y => y.KEY === x.ZattrHead).VALUE;
                        }
                        x.editable = false;
                        x.Changed = false;
                        if (x.Zdel === "") {
                            x.Zdel = false;
                        } else {
                            x.Zdel = true;
                        }
                        x.NewRow = false;
                        this.CBOPos2.push(JSON.parse(JSON.stringify(x)));
                    });
                    /*const oFinalFilter = new Filter({
                        filters: [],
                        and: false
                    });
                    let aPos1Filter = [];
                    let ZattrFilter = this.Pos1.Zattr;
                    if (this.MapName.find(y => y.VALUE === ZattrFilter) !== undefined) {
                        ZattrFilter = this.MapName.find(y => y.VALUE === ZattrFilter).KEY;
                    }
                    aPos1Filter.push(new Filter("Zattr", FilterOperator.EQ, ZattrFilter));
                    aPos1Filter.push(new Filter("Zvalue", FilterOperator.EQ, this.Pos1.Zvalue));
                    aPos1Filter.push(new Filter("Zname", FilterOperator.EQ, "RAGG_VARIET"));
                    oFinalFilter.aFilters.push(new Filter({
                        filters: aPos1Filter,
                        and: true
                    }));
                    aPos1Filter = [];
                    aPos1Filter.push(new Filter("Zattr", FilterOperator.EQ, ZattrFilter));
                    aPos1Filter.push(new Filter("Zvalue", FilterOperator.EQ, this.Pos1.Zvalue));
                    aPos1Filter.push(new Filter("Zname", FilterOperator.EQ, "RAGGCALIBR"));
                    oFinalFilter.aFilters.push(new Filter({
                        filters: aPos1Filter,
                        and: true
                    }));
                    const oPromisePos1 = new Promise((resolve, reject) => {
                        this.getView().getModel().read("/ZMM_ATTR_POS1Set", {
                            filters: [oFinalFilter],
                            success: (aData) => {
                                resolve(aData.results);
                            },
                            error: (oError) => {
                                reject;
                            }
                        });
                    });
                    oPromisePos1.then((aResultPos1) => {
                        aResultPos1.forEach(x => {
                            var oZattr2 = {
                                "Value": x.Zvalue,
                                "Descr": x.Zdescr,
                                "DescrEst": x.ZdescrEst
                            }
                            ListaZattr.push(oZattr2);
                        });*/
                    this._setTableModel(aResult);
                    /*    oAppModel.setProperty("/zattr2", ListaZattr);
                    }, oError => {
                        MessageToast.show(this.oComponent.i18n().getText("msg.error.zattributianagrafici.text"));
                        this.oComponent.resetAllBusy();
                    });*/
                }, oError => {
                    MessageToast.show(this.oComponent.i18n().getText("msg.error.zattributianagrafici.text"));
                    this.oComponent.resetAllBusy();
                });
            },
            onInserisci: function () {
                let NewRow = {
                    "ZattrHead": this.Pos1.Zattr,
                    "ZvalueHead": this.Pos1.Zvalue,
                    "Zattr": this.Pos1.Zname,
                    "Zvalue": this.Pos1.ZvalueInf,
                    "Zname": "",
                    "Zid": "",
                    "ZvalueInf": "",
                    "Zdescr": "",
                    "Ernam": "",
                    "Erdat": null,
                    "Zernam": "",
                    "Zerdat": null,
                    "Zdel": false,
                    "editable": true,
                    "Changed": false,
                    "NewRow": true
                };
                //this.RowInsertedPos2.push(NewRow);
                this.RowInsertedPos2.unshift(NewRow);
                const oAppModel = this.getView().getModel("appModel");
                const oTable = this.getView().byId("attTableIdPos2");
                this._setTableModel([]);
                //this._setTableModel(this.TableResultPos2.concat(this.RowInsertedPos2));
                this._setTableModel(this.RowInsertedPos2.concat(this.TableResultPos2));
            },
            onModifica: function () {
                this.TableResultPos2.forEach(x => {
                    if (x.Changed === true) {
                        x.editable = true;
                    }
                });
                this._setTableModel([]);
                //this._setTableModel(this.TableResultPos2.concat(this.RowInsertedPos2));
                this._setTableModel(this.RowInsertedPos2.concat(this.TableResultPos2));
            },
            onElimina: function () {
                this.TableResultPos2.concat(this.RowInsertedPos2).forEach(x => {
                    if (x.Changed === true) {
                        x.Zdel = true;
                    }
                });
                this._setTableModel([]);
                //this._setTableModel(this.TableResultPos2.concat(this.RowInsertedPos2));
                this._setTableModel(this.RowInsertedPos2.concat(this.TableResultPos2));
            },
            onRipristina: function () {
                this.TableResultPos2.concat(this.RowInsertedPos2).forEach(x => {
                    if (x.Changed === true) {
                        x.Zdel = false;
                    }
                });
                this._setTableModel([]);
                //this._setTableModel(this.TableResultPos2.concat(this.RowInsertedPos2));
                this._setTableModel(this.RowInsertedPos2.concat(this.TableResultPos2));
            },
            onAnnulla: function () {
                this.RowInsertedPos2 = [];
                this._setTableModel([]);
                this._setTableModel(this.TableResultPos2);
            },
            onSalva: function () {
                this.RowDeletedPos2 = [];
                var Errore = "";
                Errore = this._controlloErrori(Errore);
                if (Errore === "") {
                    const oPromiseUpdate = new Promise((resolve, reject) => {
                        this.onSalvaUpdate(resolve, reject);
                    });
                    oPromiseUpdate.then(() => {
                        const oPromiseInserisci = new Promise((resolve, reject) => {
                            this.onSalvaInserisci(resolve, reject);
                        });
                        oPromiseInserisci.then(() => {
                            //this.onSearch();
                            this._onObjectMatched();
                        }, oError => {
                            //this.onSearch();
                            this._onObjectMatched();
                        });
                    }, oError => {
                        //this.onSearch();
                        this._onObjectMatched();
                    });
                } else {
                    MessageBox.error(Errore);
                }
            },
            onSalvaInserisci: function (resolve, reject) {
                var batchChanges = [];
                var sServiceUrl = "/sap/opu/odata/sap/ZATTRIBUTIANAGRAFICI_SRV/";
                var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
                if (this.RowInsertedPos2.length === 0) {
                    resolve();
                } else {
                    for (var i = 0; i < this.RowInsertedPos2.length; i++) {
                        if (this.RowInsertedPos2[i].Zdel === false) {
                            var oData = this.RowInsertedPos2[i];
                            delete oData.editable;
                            delete oData.NewRow;
                            delete oData.Changed;
                            oData.Zdel = "";
                            var aId = this.TableResultPos2.concat(this.RowInsertedPos2).filter(y => y.Zname === oData.Zname && y.Zid !== "");
                            if (aId.length === 0) {
                                oData.Zid = 1;
                                oData.Zid = oData.Zid.toString().padStart(3, 0);
                            }
                            else {
                                aId.sort(function (a, b) { return b.Zid - a.Zid });
                                oData.Zid = parseFloat(aId[0].Zid) + 1;
                                oData.Zid = oData.Zid.toString().padStart(3, 0);
                            }
                            if (this.MapName1.find(y => y.VALUE === oData.Zattr) !== undefined) {
                                oData.Zattr = this.MapName1.find(y => y.VALUE === oData.Zattr).KEY;
                            }
                            if (this.MapName.find(y => y.VALUE === oData.ZattrHead) !== undefined) {
                                oData.ZattrHead = this.MapName.find(y => y.VALUE === oData.ZattrHead).KEY;
                            }
                            if (this.MapName2.find(y => y.VALUE === oData.Zname) !== undefined) {
                                oData.Zname = this.MapName.find(y => y.VALUE === oData.Zname).KEY;
                            }
                            batchChanges.push(oDataModel.createBatchOperation("ZMM_ATTR_POS2Set", "POST", oData));
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
            onSalvaUpdate: function (resolve, reject) {
                var batchChanges = [];
                var sServiceUrl = "/sap/opu/odata/sap/ZATTRIBUTIANAGRAFICI_SRV/";
                var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
                if (this.RowModifyPos2.length === 0) {
                    resolve();
                } else {
                    this.RowModifyPos2.forEach(x => {
                        if (this.MapName1.find(y => y.VALUE === x.Zattr) !== undefined) {
                            x.Zattr = this.MapName1.find(y => y.VALUE === x.Zattr).KEY;
                        }
                        if (this.MapName.find(y => y.VALUE === x.ZattrHead) !== undefined) {
                            x.ZattrHead = this.MapName.find(y => y.VALUE === x.ZattrHead).KEY;
                        }
                        if (this.MapName2.find(y => y.VALUE === x.Zname) !== undefined) {
                            x.Zname = this.MapName2.find(y => y.VALUE === x.Zname).KEY;
                        }
                        var ModifyString = "ZMM_ATTR_POS2Set(ZattrHead='" + x.ZattrHead + "',ZvalueHead='" + x.ZvalueHead + "',Zattr='" + x.Zattr + "',Zvalue='" + x.Zvalue + "',Zname='" + x.Zname + "',Zid='" + x.Zid + "',ZvalueInf='" + x.ZvalueInf + "')";
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
            onNavBack: function () {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();
                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("RouteView2", {}, true);
                }
            },
            onZvalueVHRequest: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue(),
                    oView = this.getView();
                this.IndiceValueHelp = oEvent.getSource().getParent().getIndex();
                var Selected = this.getView().byId("attTableIdPos2").getContextByIndex(this.IndiceValueHelp).getObject();
                var ListaZattr = [];
                const oFinalFilter = new Filter({
                    filters: [],
                    and: false
                });

                let ZattrFilter = this.Pos1.Zattr;
                let ZvalueFilter = Selected.Zname;
                if (this.MapName.find(y => y.VALUE === ZattrFilter) !== undefined) {
                    ZattrFilter = this.MapName.find(y => y.VALUE === ZattrFilter).KEY;
                }
                if (this.MapName2.find(y => y.VALUE === ZvalueFilter) !== undefined) {
                    ZvalueFilter = this.MapName.find(y => y.VALUE === ZvalueFilter).KEY;
                }
                let aPos1Filter = [];
                aPos1Filter.push(new Filter("Zattr", FilterOperator.EQ, ZattrFilter));
                aPos1Filter.push(new Filter("Zvalue", FilterOperator.EQ, this.Pos1.Zvalue));
                aPos1Filter.push(new Filter("Zname", FilterOperator.EQ, ZvalueFilter));
                oFinalFilter.aFilters.push(new Filter({
                    filters: aPos1Filter,
                    and: true
                }));
                const oPromisePos1 = new Promise((resolve, reject) => {
                    this.getView().getModel().read("/ZMM_ATTR_POS1Set", {
                        filters: [oFinalFilter],
                        success: (aData) => {
                            resolve(aData.results);
                        },
                        error: (oError) => {
                            reject;
                        }
                    });
                });
                oPromisePos1.then((aResultPos1) => {
                    aResultPos1.forEach(x => {
                        var oZattr2 = {
                            "Value": x.ZvalueInf,
                            "Descr": x.Zdescr,
                            "DescrEst": x.ZdescrEst
                        }
                        ListaZattr.push(oZattr2);
                    });
                    const oAppModel = this.getView().getModel("appModel");
                    oAppModel.setProperty("/zvalue2", ListaZattr);
                    // create value help dialog
                    this._pValueHelpDialog = Fragment.load({
                        id: "Zvalue",
                        name: "it.orogel.attributianagrafici.view.VHDialogZvalue2",
                        controller: this
                    }).then(function (oValueHelpDialog) {
                        oView.addDependent(oValueHelpDialog);
                        return oValueHelpDialog;
                    });
                    this._pValueHelpDialog.then(function (oValueHelpDialog) {
                        oValueHelpDialog.open(sInputValue);
                    });
                }, oError => {
                    MessageToast.show(this.oComponent.i18n().getText("msg.error.zattributianagrafici.text"));
                    this.oComponent.resetAllBusy();
                });
            }, onSearchZvalue: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter({
                    filters: [
                        new Filter("Value", FilterOperator.Contains, sValue),
                        new Filter("Descr", FilterOperator.Contains, sValue),
                        new Filter("DescrEst", FilterOperator.Contains, sValue),
                    ],
                    and: false
                });
                var oBinding = oEvent.getParameter("itemsBinding");
                oBinding.filter([oFilter]);
            }, onZattrVHRequest: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue(),
                    oView = this.getView();
                this.IndiceValueHelp = oEvent.getSource().getParent().getIndex();
                // create value help dialog
                this._pValueHelpDialog = Fragment.load({
                    id: "Zattr",
                    name: "it.orogel.attributianagrafici.view.VHDialogZattr2",
                    controller: this
                }).then(function (oValueHelpDialog) {
                    oView.addDependent(oValueHelpDialog);
                    return oValueHelpDialog;
                });
                this._pValueHelpDialog.then(function (oValueHelpDialog) {
                    oValueHelpDialog.open(sInputValue);
                });
            },
            onVHDialogZvalueClose: function (oEvent) {
                var aSelectedItems = oEvent.getParameter("selectedItems");
                if (aSelectedItems && aSelectedItems.length > 0) {
                    var oSelected = this.getView().byId("attTableIdPos2").getContextByIndex(this.IndiceValueHelp).getObject();
                    var ZvalueInf = oEvent.getParameter("selectedContexts").map(function (oContext) { return oContext.getObject().Value; })[0];
                    var Zdescr = oEvent.getParameter("selectedContexts").map(function (oContext) { return oContext.getObject().Descr; })[0];
                    var ZdescrEst = oEvent.getParameter("selectedContexts").map(function (oContext) { return oContext.getObject().DescrEst; })[0];
                    oSelected.ZvalueInf = ZvalueInf;
                    oSelected.Zdescr = Zdescr;
                    oSelected.ZdescrEst = ZdescrEst;
                    this._setTableModel([]);
                    //this._setTableModel(this.TableResultPos2.concat(this.RowInsertedPos2));
                    this._setTableModel(this.RowInsertedPos2.concat(this.TableResultPos2));
                }
            }, onSearchZvalue: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter({
                    filters: [
                        new Filter("Value", FilterOperator.Contains, sValue),
                    ],
                    and: false
                });
                var oBinding = oEvent.getParameter("itemsBinding");
                oBinding.filter([oFilter]);
            }, onVHDialogZattrClose: function (oEvent) {
                var aSelectedItems = oEvent.getParameter("selectedItems");
                if (aSelectedItems && aSelectedItems.length > 0) {
                    var oSelected = this.getView().byId("attTableIdPos2").getContextByIndex(this.IndiceValueHelp).getObject();
                    oSelected.Zname = aSelectedItems[0].getTitle();
                    this._setTableModel([]);
                    this._setTableModel(this.RowInsertedPos2.concat(this.TableResultPos2));
                }
            },
            onExportToExcel: function (oEvent) {
                /*global XLSX*/
                const oDataExcel = [];
                this.TableResultPos2.forEach(y => {
                    var del = "";
                    if (y.Zdel === true) {
                        del = "X";
                    }
                    var oAttributo = {
                        "Nome Attributo": this.Pos1.Zname,
                        "Voce Attributo": this.Pos1.ZvalueInf,
                        "Nome Attributo Correlato": y.Zname,
                        "Numero Posizione": y.Zid,
                        "Valore Attributo Posizione": y.ZvalueInf,
                        "Descrizione Attributo": y.Zdescr,
                        "Creato Da": y.Ernam,
                        "Data Creazione": y.Erdat,
                        "Modificato Da": y.Zernam,
                        "Data Modifica": y.Zerdat,
                        "Cancellazione": del,
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
                XLSX.writeFile(wb, this.getView().getModel("i18n").getResourceBundle().getText("title3") + ".xlsx");
            }
        });
        /**
        * Set table model 
        * ---------------
        * @param aProducts - products
        * @private
        */
        oAppController.prototype._setTableModel = function (aResults) {
            if (this.TableResultPos2.length === 0 && this.RowInsertedPos2.length === 0) {
                this.TableResultPos2 = aResults;
            }
            //set model: concat new batch of data to previous model
            const oAppModel = this.getView().getModel("appModel");
            const oTable = this.getView().byId("attTableIdPos2");
            oAppModel.setProperty("/rows2", aResults);
            oTable.setModel(oAppModel);
            oTable.bindRows("/rows2");
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
            this.RowInsertedPos2.forEach(x => {
                x.ZvalueInf = x.ZvalueInf.toUpperCase();
                x.ZvalueHead = x.ZvalueHead.toUpperCase();
                x.Zvalue = x.Zvalue.toUpperCase();
                if (x.Zname === "" || x.ZvalueInf === "") {
                    Errori = Errori + "Valorizzare i campi obbligatori\n";
                }
                var ZnameKey = "";
                if (this.MapName2.find(y => y.VALUE === x.Zname) !== undefined) {
                    ZnameKey = this.MapName.find(y => y.VALUE === x.Zname).KEY;
                }
                if (MapDescrizione.find(y => y.Zattr === ZnameKey) !== undefined) {
                    if (MapDescrizione.find(y => y.Zattr === ZnameKey).Zlung < x.Zdescr.length) {
                        Errori = Errori + "Descrizione breve non ammessa perchè troppo lungo per " + x.Zattr + " " + x.Zvalue + " " + x.Zname + " " + x.Zid + " " + x.ZvalueInf + ".Il numero massimo di caratteri è" + MapDescrizione.find(y => y.Zattr === ZnameKey).Zlung + "\n";
                    }
                }
                if (this.MapName2.find(y => y.VALUE === x.Zname) !== undefined) {
                    /*if (this.MapName2.find(y => y.VALUE === x.Zname).LENGTH < x.ZvalueInf.length) {
                        Errori = Errori + "Valore non ammesso perchè troppo lungo per " + x.Zattr + " " + x.Zvalue + " " + x.Zname + " " + x.Zid + " " + x.ZvalueInf + "\n";
                    }*/
                    if (this.MapName2.find(y => y.VALUE === x.Zname).LENGTH !== x.ZvalueInf.length) {
                        Errori = Errori + "Il codice inserito non è della lunghezza corretta per " + x.Zattr + " " + x.Zvalue + " " + x.Zname + " " + x.Zid + " " + x.ZvalueInf + "\n";
                    }
                }
                var find = this.TableResultPos2.find(y => y.ZattrHead === x.ZattrHead && y.ZvalueHead === x.ZvalueHead && y.Zattr === x.Zattr && y.Zvalue === x.Zvalue && y.Zname === x.Zname && y.Zid === x.Zid && y.ZvalueInf === x.ZvalueInf);
                if (find !== undefined) {
                    Errori = Errori + "Chiave già esistente a sistema: " + " " + x.ZattrHead + " " + x.ZvalueHead + " " + x.Zattr + " " + x.Zvalue + " " + x.Zname + " " + x.Zid + " " + x.ZvalueInf + "\n";
                }
            });
            if (Errori === "") {
                for (var i = 0; i < this.TableResultPos2.length; i++) {
                    if (this.TableResultPos2[i].Zdel === true) {
                        this.TableResultPos2[i].Zdel = "X";
                    } else if (this.TableResultPos2[i].Zdel === false) {
                        this.TableResultPos2[i].Zdel = "";
                    }
                    delete this.TableResultPos2[i].editable;
                    delete this.TableResultPos2[i].NewRow;
                    delete this.TableResultPos2[i].Changed;
                    if (this.CBOPos2[i].Zdel === false) {
                        this.CBOPos2[i].Zdel = "";
                    } else if (this.CBOPos2[i].Zdel === true) {
                        this.CBOPos2[i].Zdel = "X";
                    }
                    delete this.CBOPos2[i].editable;
                    delete this.CBOPos2[i].NewRow;
                    delete this.CBOPos2[i].Changed;
                    if (JSON.stringify(this.TableResultPos2[i]) !== JSON.stringify(this.CBOPos2[i])) {
                        this.RowModifyPos2.push(this.TableResultPos2[i]);
                    }
                }
            }
            return Errori;
        };
        return oAppController;
    }); 