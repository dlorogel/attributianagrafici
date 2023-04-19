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


        const oAppController = Controller.extend("it.orogel.attributianagrafici.controller.Pos1", {
            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("RouteView2").attachPatternMatched(this._onObjectMatched, this);
                this.oComponent = this.getOwnerComponent();
            },
            onSelectAll: function () {
                const oAppModel = this.getView().getModel("appModel");
                var Seleziona = oAppModel.getProperty("/rows1");
                Seleziona.forEach(x => {
                    x.Changed = this.byId("selectAllCheckBoxId").getSelected();
                });
                oAppModel.refresh(true);
            },
            onSearch: function () {
                this.oComponent.busy(true);
                const oAppModel = this.getView().getModel("appModel");
                //this.TableResultPos1 = [];
                //this.CBOPos1 = [];
                this.RowInsertedPos1 = [];
                this.TableResultPos1Filtered = [];
                this.RowModifyPos1 = [];
                //this.MapName1 = Constants.ZNAME_MAP1;
                //this.Header = this.getOwnerComponent().getHeader();
                this.NomeAttributoInput = this.getView().byId("NomeAttributoInputFilter").getValue();
                if (this.MapName1.find(y => y.VALUE === this.NomeAttributoInput) !== undefined) {
                    this.NomeAttributoInput = this.MapName1.find(y => y.VALUE === this.NomeAttributoInput).KEY;
                }
                this.ValoreAttributoInput = this.getView().byId("ValoreAttributoInputFilter").getValue();
                this.CancellazioneInput = this.getView().byId("CancellazioneInput").getSelected();
                const oFinalFilter = new Filter({
                    filters: [],
                    and: true
                });
                var filterzattr = this.Header.Zattr;
                if (this.MapName.find(y => y.VALUE === this.Header.Zattr) !== undefined) {
                    filterzattr = this.MapName.find(y => y.VALUE === this.Header.Zattr).KEY;
                }
                let aNomeCampoFilter = [];
                aNomeCampoFilter.push(new Filter("Zattr", FilterOperator.EQ, filterzattr));
                oFinalFilter.aFilters.push(new Filter({
                    filters: aNomeCampoFilter,
                    and: false
                }));
                let aValoreCampoFilter = [];
                aValoreCampoFilter.push(new Filter("Zvalue", FilterOperator.EQ, this.Header.Zvalue));
                oFinalFilter.aFilters.push(new Filter({
                    filters: aValoreCampoFilter,
                    and: false
                }));
                if (this.NomeAttributoInput !== undefined && this.NomeAttributoInput !== "") {
                    let aValoreCampoFilter = [];
                    aValoreCampoFilter.push(new Filter("Zname", FilterOperator.EQ, this.NomeAttributoInput));
                    oFinalFilter.aFilters.push(new Filter({
                        filters: aValoreCampoFilter,
                        and: false
                    }));
                };
                if (this.ValoreAttributoInput !== undefined && this.ValoreAttributoInput !== "") {
                    let aValoreCampoFilter = [];
                    aValoreCampoFilter.push(new Filter("ZvalueInf", FilterOperator.EQ, this.ValoreAttributoInput));
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
                const oPromiseAttributi = new Promise((resolve, reject) => {
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
                oPromiseAttributi.then((aResult) => {
                    this.oComponent.resetAllBusy();
                    aResult.forEach(x => {
                        x.Zattr = this.Header.Zattr;
                        x.Zvalue = this.Header.Zvalue;
                        if (this.MapName.find(y => y.KEY === x.Zattr) !== undefined) {
                            x.Zattr = this.MapName.find(y => y.KEY === x.Zattr).VALUE;
                        }
                        if (this.MapName1.find(y => y.KEY === x.Zname) !== undefined) {
                            x.Zname = this.MapName1.find(y => y.KEY === x.Zname).VALUE;
                        }
                        x.editable = false;
                        x.Changed = false;
                        if (x.Zdel === "") {
                            x.Zdel = false;
                        } else {
                            x.Zdel = true;
                        }
                        x.NewRow = false;
                        //this.CBOPos1.push(JSON.parse(JSON.stringify(x)));
                    });
                    this.TableResultPos1Filtered = aResult;
                    this._setTableModel(aResult);
                }, oError => {
                    MessageToast.show(this.oComponent.i18n().getText("msg.error.zattributianagrafici.text"));
                    this.oComponent.resetAllBusy();
                });
            },
            onReset: function () {
                this.getView().byId("NomeAttributoInputFilter").setValue("");
                this.getView().byId("ValoreAttributoInputFilter").setValue("");
                this.getView().byId("CancellazioneInput").setSelected(false);
            },
            _onObjectMatched: function (oEvent) {
                this.oComponent.busy(true);
                var oAppModel = this.getView().getModel("appModel");
                this.TableResultPos1 = [];
                this.CBOPos1 = [];
                this.TableResultPos1Filtered = [];
                this.RowInsertedPos1 = [];
                this.RowModifyPos1 = [];
                this.MapName = Constants.ZNAME_MAP;
                this.MapName1 = Constants.ZNAME_MAP1;
                this.Header = this.getOwnerComponent().getHeader();
                this.getView().byId("NomeCampoInput").setValue(this.Header.Zattr);
                this.getView().byId("ValoreCampoInput").setValue(this.Header.Zvalue);
                this.getView().byId("DescrizioneCampoInput").setValue(this.Header.Zdescr);

                const oFinalFilter = new Filter({
                    filters: [],
                    and: true
                });
                var filterzattr = this.Header.Zattr;
                if (this.MapName.find(y => y.VALUE === this.Header.Zattr) !== undefined) {
                    filterzattr = this.MapName.find(y => y.VALUE === this.Header.Zattr).KEY;
                }
                let aNomeCampoFilter = [];
                aNomeCampoFilter.push(new Filter("Zattr", FilterOperator.EQ, filterzattr));
                oFinalFilter.aFilters.push(new Filter({
                    filters: aNomeCampoFilter,
                    and: false
                }));
                let aValoreCampoFilter = [];
                aValoreCampoFilter.push(new Filter("Zvalue", FilterOperator.EQ, this.Header.Zvalue));
                oFinalFilter.aFilters.push(new Filter({
                    filters: aValoreCampoFilter,
                    and: false
                }));
                const oPromiseAttributi = new Promise((resolve, reject) => {
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
                /*const oPromiseAllAttributi = new Promise((resolve, reject) => {
                    this.getView().getModel().read("/ZMM_ATTR_POS1Set", {
                        success: (aData) => {
                            resolve(aData.results);
                        },
                        error: (oError) => {
                            reject;
                        }
                    });
                });
                oPromiseAllAttributi.then((aResult) => {
                    this._setTableModel(aResult);
                    this.onSearch();
                }, oError => {
                    MessageToast.show(this.oComponent.i18n().getText("msg.error.zattributianagrafici.text"));
                    this.oComponent.resetAllBusy();
                });*/
                oPromiseAttributi.then((aResult) => {
                    var ListaZvalue = [];
                    let aUniqueZvalue = [...new Set(aResult.map(item => item.ZvalueInf))];
                    aUniqueZvalue.forEach(x => {
                        var Find = aResult.find(y => y.ZvalueInf === x);
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

                    this.oComponent.resetAllBusy();
                    aResult.forEach(x => {
                        x.Zattr = this.Header.Zattr;
                        x.Zvalue = this.Header.Zvalue;
                        if (this.MapName.find(y => y.KEY === x.Zattr) !== undefined) {
                            x.Zattr = this.MapName.find(y => y.KEY === x.Zattr).VALUE;
                        }
                        if (this.MapName1.find(y => y.KEY === x.Zname) !== undefined) {
                            x.Zname = this.MapName1.find(y => y.KEY === x.Zname).VALUE;
                        }
                        x.editable = false;
                        x.Changed = false;
                        if (x.Zdel === "") {
                            x.Zdel = false;
                        } else {
                            x.Zdel = true;
                        }
                        x.NewRow = false;
                        this.CBOPos1.push(JSON.parse(JSON.stringify(x)));
                    });
                    this._setTableModel(aResult);
                    oAppModel.setProperty("/zvalue1", ListaZvalue);
                    if (this.Header.Zattr === "Specie") {
                        oAppModel.setProperty("/CopiaAttributi", true);
                    } else {
                        oAppModel.setProperty("/CopiaAttributi", false);
                    }
                }, oError => {
                    MessageToast.show(this.oComponent.i18n().getText("msg.error.zattributianagrafici.text"));
                    this.oComponent.resetAllBusy();
                });
            },
            onInserisci: function () {
                let NewRow = {
                    "Zattr": this.Header.Zattr,
                    "Zvalue": this.Header.Zvalue,
                    "Zname": "",
                    "Zid": "",
                    "ZvalueInf": "",
                    "Zdescr": "",
                    "ZdescrEst": "",
                    "Ernam": "",
                    "Erdat": null,
                    "Zernam": "",
                    "Zerdat": null,
                    "Zdel": false,
                    "editable": true,
                    "Changed": false,
                    "NewRow": true
                };
                //this.RowInsertedPos1.push(NewRow);
                this.RowInsertedPos1.unshift(NewRow);
                const oAppModel = this.getView().getModel("appModel");
                const oTable = this.getView().byId("attTableIdPos1");
                this._setTableModel([]);
                //this._setTableModel(this.TableResultPos1.concat(this.RowInsertedPos1));
                if (this.TableResultPos1Filtered.length > 0) {
                    this._setTableModel(this.RowInsertedPos1.concat(this.TableResultPos1Filtered));
                } else {
                    this._setTableModel(this.RowInsertedPos1.concat(this.TableResultPos1));
                }
            },
            onCopiaTestata: function () {
                this.NomeAttributoInput = this.getView().byId("NomeAttributoInputFilter").getValue();
                this.RowInsertedPos1.forEach(x => {
                    if (x.Zname === "") {
                        x.Zname = this.NomeAttributoInput;
                    }
                });
                this._setTableModel([]);
                if (this.TableResultPos1Filtered.length > 0) {
                    this._setTableModel(this.RowInsertedPos1.concat(this.TableResultPos1Filtered));
                } else {
                    this._setTableModel(this.RowInsertedPos1.concat(this.TableResultPos1));
                }
            },
            onModifica: function () {
                if (this.TableResultPos1Filtered.length > 0) {
                    this.TableResultPos1Filtered.forEach(x => {
                        if (x.Changed === true) {
                            x.editable = true;
                        }
                    });
                } else {
                    this.TableResultPos1.forEach(x => {
                        if (x.Changed === true) {
                            x.editable = true;
                        }
                    });
                }
                this._setTableModel([]);
                //this._setTableModel(this.TableResultPos1.concat(this.RowInsertedPos1));
                if (this.TableResultPos1Filtered.length > 0) {
                    this._setTableModel(this.RowInsertedPos1.concat(this.TableResultPos1Filtered));
                } else {
                    this._setTableModel(this.RowInsertedPos1.concat(this.TableResultPos1));
                }
            },
            onElimina: function () {
                if (this.TableResultPos1Filtered.length > 0) {
                    this.TableResultPos1Filtered.concat(this.RowInsertedPos1).forEach(x => {
                        if (x.Changed === true) {
                            x.Zdel = true;
                        }
                    });
                } else {
                    this.TableResultPos1.concat(this.RowInsertedPos1).forEach(x => {
                        if (x.Changed === true) {
                            x.Zdel = true;
                        }
                    });
                }
                this._setTableModel([]);
                //this._setTableModel(this.TableResultPos1.concat(this.RowInsertedPos1));
                if (this.TableResultPos1Filtered.length > 0) {
                    this._setTableModel(this.RowInsertedPos1.concat(this.TableResultPos1Filtered));
                } else {
                    this._setTableModel(this.RowInsertedPos1.concat(this.TableResultPos1));
                }
            },
            onRipristina: function () {
                if (this.TableResultPos1Filtered.length > 0) {
                    this.TableResultPos1Filtered.concat(this.RowInsertedPos1).forEach(x => {
                        if (x.Changed === true) {
                            x.Zdel = false;
                        }
                    });
                } else {
                    this.TableResultPos1.concat(this.RowInsertedPos1).forEach(x => {
                        if (x.Changed === true) {
                            x.Zdel = false;
                        }
                    });
                }
                this._setTableModel([]);
                //this._setTableModel(this.TableResultPos1.concat(this.RowInsertedPos1));
                if (this.TableResultPos1Filtered.length > 0) {
                    this._setTableModel(this.RowInsertedPos1.concat(this.TableResultPos1Filtered));
                } else {
                    this._setTableModel(this.RowInsertedPos1.concat(this.TableResultPos1));
                }
            },
            onAnnulla: function () {
                this.RowInsertedPos1 = [];
                if (this.TableResultPos1Filtered.length > 0) {
                    for (var i = 0; i < this.TableResultPos1Filtered.length; i++) {
                        this.TableResultPos1Filtered[i].Zdescr = this.CBOPos1[i].Zdescr;
                        this.TableResultPos1Filtered[i].ZdescrEst = this.CBOPos1[i].ZdescrEst;
                    }
                } else {
                    for (var i = 0; i < this.TableResultPos1.length; i++) {
                        this.TableResultPos1[i].Zdescr = this.CBOPos1[i].Zdescr;
                        this.TableResultPos1[i].ZdescrEst = this.CBOPos1[i].ZdescrEst;
                    }
                }
                this._setTableModel([]);
                if (this.TableResultPos1Filtered.length > 0) {
                    this._setTableModel(this.TableResultPos1Filtered);
                } else {
                    this._setTableModel(this.TableResultPos1);
                }
            },
            onSalva: function () {
                this.RowDeletedPos1 = [];
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
                if (this.RowInsertedPos1.length === 0) {
                    resolve();
                } else {
                    for (var i = 0; i < this.RowInsertedPos1.length; i++) {
                        if (this.RowInsertedPos1[i].Zdel === false) {
                            var oData = this.RowInsertedPos1[i];
                            delete oData.editable;
                            delete oData.NewRow;
                            delete oData.Changed;
                            oData.Zdel = "";
                            var aId = this.TableResultPos1.concat(this.RowInsertedPos1).filter(y => y.Zname === oData.Zname && y.Zid !== "");
                            if (aId.length === 0) {
                                oData.Zid = 1;
                                oData.Zid = oData.Zid.toString().padStart(3, 0);
                            }
                            else {
                                aId.sort(function (a, b) { return b.Zid - a.Zid });
                                oData.Zid = parseFloat(aId[0].Zid) + 1;
                                oData.Zid = oData.Zid.toString().padStart(3, 0);
                            }
                            if (this.MapName.find(y => y.VALUE === oData.Zattr) !== undefined) {
                                oData.Zattr = this.MapName.find(y => y.VALUE === oData.Zattr).KEY;
                            }
                            if (this.MapName1.find(y => y.VALUE === oData.Zname) !== undefined) {
                                oData.Zname = this.MapName1.find(y => y.VALUE === oData.Zname).KEY;
                            }
                            if (oData.Zname === "CALIBRAZ") {
                                if (!this.TableResultPos1.concat(this.RowInsertedPos1).find(x => x.Zname === "Raggrupamento Calibrazione" || x.Zname === "RAGGCALIBR")) {
                                    {
                                        var oDataCalibraz = JSON.parse(JSON.stringify(oData));
                                        oDataCalibraz.Zname = "RAGGCALIBR";
                                        batchChanges.push(oDataModel.createBatchOperation("ZMM_ATTR_POS1Set", "POST", oDataCalibraz));
                                    }
                                }
                                var oDataPos2 = {};
                                oDataPos2.Erdat = null;
                                oDataPos2.Ernam = "";
                                oDataPos2.ZattrHead = oData.Zattr;
                                oDataPos2.Zattr = oData.Zname;
                                oDataPos2.Zname = "RAGGCALIBR";
                                oDataPos2.Zdel = "";
                                oDataPos2.Zdescr = oData.Zdescr;
                                oDataPos2.ZdescrEst = oData.ZdescrEst;
                                oDataPos2.Zerdat = null;
                                oDataPos2.Zernam = "";
                                oDataPos2.Zid = "001";
                                oDataPos2.ZvalueHead = oData.Zvalue;
                                oDataPos2.Zvalue = oData.ZvalueInf;
                                oDataPos2.ZvalueInf = oData.ZvalueInf;
                                batchChanges.push(oDataModel.createBatchOperation("ZMM_ATTR_POS2Set", "POST", oDataPos2));
                            }
                            batchChanges.push(oDataModel.createBatchOperation("ZMM_ATTR_POS1Set", "POST", oData));
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
                if (this.RowModifyPos1.length === 0) {
                    resolve();
                } else {
                    this.RowModifyPos1.forEach(x => {
                        if (this.MapName.find(y => y.VALUE === x.Zattr) !== undefined) {
                            x.Zattr = this.MapName.find(y => y.VALUE === x.Zattr).KEY;
                        }
                        if (this.MapName1.find(y => y.VALUE === x.Zname) !== undefined) {
                            x.Zname = this.MapName1.find(y => y.VALUE === x.Zname).KEY;
                        }
                        var ModifyString = "ZMM_ATTR_POS1Set(Zattr='" + x.Zattr + "',Zvalue='" + x.Zvalue + "',Zname='" + x.Zname + "',Zid='" + x.Zid + "',ZvalueInf='" + x.ZvalueInf + "')";
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
                var header = this.getView().byId("attTableIdPos1").getContextByIndex(index).getObject();
                header.ZdescrEst = header.Zdescr;
            },
            onNavBack: function () {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();
                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("RouteView1", {}, true);
                }
            },
            onNavToPos2: function (oEvent) {
                var index = oEvent.getSource().getParent().getIndex();
                var Pos1 = this.getView().byId("attTableIdPos1").getContextByIndex(index).getObject();
                this.getOwnerComponent().setPos1(Pos1);
                this.getOwnerComponent().getRouter().navTo("RouteView3");
            },
            onZattrVHRequest: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue(),
                    oView = this.getView();
                this.IndiceValueHelp = oEvent.getSource().getParent().getIndex();
                // create value help dialog
                this._pValueHelpDialog = Fragment.load({
                    id: "Zattr",
                    name: "it.orogel.attributianagrafici.view.VHDialogZattr1",
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
                    var oSelected = this.getView().byId("attTableIdPos1").getContextByIndex(this.IndiceValueHelp).getObject();
                    oSelected.Zname = aSelectedItems[0].getTitle();
                    this._setTableModel([]);
                    //this._setTableModel(this.TableResultPos1.concat(this.RowInsertedPos1));
                    if (this.TableResultPos1Filtered.length > 0) {
                        this._setTableModel(this.RowInsertedPos1.concat(this.TableResultPos1Filtered));
                    } else {
                        this._setTableModel(this.RowInsertedPos1.concat(this.TableResultPos1));
                    }
                }
            },
            onZattrVHRequestFilterPos1: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue(),
                    oView = this.getView();
                // create value help dialog
                this._pValueHelpDialog = Fragment.load({
                    id: "ZattrPos1",
                    name: "it.orogel.attributianagrafici.view.VHDialogZattrFilterPos1",
                    controller: this
                }).then(function (oValueHelpDialog) {
                    oView.addDependent(oValueHelpDialog);
                    return oValueHelpDialog;
                });
                this._pValueHelpDialog.then(function (oValueHelpDialog) {
                    oValueHelpDialog.open(sInputValue);
                });
            },
            onVHDialogZattrCloseFilterPos1: function (oEvent) {
                var aSelectedItems = oEvent.getParameter("selectedItems");
                if (aSelectedItems && aSelectedItems.length > 0) {
                    this.getView().byId("NomeAttributoInputFilter").setValue(aSelectedItems[0].getTitle());
                }
            },
            onZvalueVHRequestFilterPos1: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue(),
                    oView = this.getView();
                // create value help dialog
                this._pValueHelpDialog = Fragment.load({
                    id: "ZvaluePos1",
                    name: "it.orogel.attributianagrafici.view.VHDialogZvalueFilterPos1",
                    controller: this
                }).then(function (oValueHelpDialog) {
                    oView.addDependent(oValueHelpDialog);
                    return oValueHelpDialog;
                });
                this._pValueHelpDialog.then(function (oValueHelpDialog) {
                    oValueHelpDialog.getBinding("items").filter([new Filter("Value", FilterOperator.Contains, sInputValue)]);
                    oValueHelpDialog.open(sInputValue);
                });
            }, onVHDialogZvalueCloseFilterPos1: function (oEvent) {
                var aSelectedItems = oEvent.getParameter("selectedItems");
                if (aSelectedItems && aSelectedItems.length > 0) {
                    var aSelezionato = aSelectedItems[0].getTitle().split(" | ");
                    this.getView().byId("ValoreAttributoInputFilter").setValue(aSelezionato[0]);
                }
            },
            onExportToExcel: function (oEvent) {
                this.oComponent.busy(true);
                /*global XLSX*/
                var oDataExcel = [];
                var aDataTable = [];
                if (this.TableResultPos1Filtered.length > 0) {
                    aDataTable = this.TableResultPos1Filtered;
                } else {
                    aDataTable = this.TableResultPos1;
                }
                aDataTable.forEach(y => {
                    var del = "";
                    if (y.Zdel === true) {
                        del = "X";
                    }
                    var oAttributo = {
                        "NomeAttributo": this.Header.Zattr,
                        "VoceAttributo": this.Header.Zvalue,
                        "NomeAttributoCorrelato": y.Zname,
                        "NumeroPosizione": y.Zid,
                        "ValoreAttributoPosizione": y.ZvalueInf,
                        "DescrizioneAttributo": y.Zdescr,
                        "DescrizioneEstesaAttributo": y.ZdescrEst,
                        "CreatoDa": y.Ernam,
                        "DataCreazione": y.Erdat,
                        "ModificatoDa": y.Zernam,
                        "DataModifica": y.Zerdat,
                        "Cancellazione": del,
                    };
                    oDataExcel.push(oAttributo);
                });
                const oFinalFilter = new Filter({
                    filters: [],
                    and: false
                });
                oDataExcel.forEach(y => {
                    let aNomeCampoFilter = [];
                    var ZattrPos1 = y.NomeAttributoCorrelato;
                    if (this.MapName1.find(z => z.VALUE === y.NomeAttributoCorrelato) !== undefined) {
                        ZattrPos1 = this.MapName1.find(z => z.VALUE === y.NomeAttributoCorrelato).KEY;
                    }
                    var ZattrHead = y.NomeAttributo;
                    if (this.MapName.find(z => z.VALUE === y.NomeAttributo) !== undefined) {
                        ZattrHead = this.MapName.find(z => z.VALUE === y.NomeAttributo).KEY;
                    }
                    aNomeCampoFilter.push(new Filter("Zattr", FilterOperator.EQ, ZattrPos1));
                    aNomeCampoFilter.push(new Filter("Zvalue", FilterOperator.EQ, y.ValoreAttributoPosizione));
                    aNomeCampoFilter.push(new Filter("ZattrHead", FilterOperator.EQ, ZattrHead));
                    aNomeCampoFilter.push(new Filter("ZvalueHead", FilterOperator.EQ, y.VoceAttributo));
                    oFinalFilter.aFilters.push(new Filter({
                        filters: aNomeCampoFilter,
                        and: true
                    }));
                });
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
                    var aRows = [];
                    aRows.push(this.insertHeader());
                    aRows.push(this.insertHeaderRow());
                    aRows.push(this.insertSpace());
                    aRows.push(this.insertPos());
                    oDataExcel.forEach(z => {
                        var ZattrPos1 = z.NomeAttributoCorrelato;
                        if (this.MapName1.find(a => a.VALUE === z.NomeAttributoCorrelato) !== undefined) {
                            ZattrPos1 = this.MapName1.find(a => a.VALUE === z.NomeAttributoCorrelato).KEY;
                        }
                        var Pos2 = aResult.filter(y => y.Zattr === ZattrPos1 && y.Zvalue === z.ValoreAttributoPosizione);
                        if (Pos2.length > 0) {
                            Pos2.forEach(b => {
                                aRows.push(this.insertPosRow(z, b));
                            });
                        } else {
                            aRows.push(this.insertPosRow0(z));
                        }
                    });

                    let wb = XLSX.utils.book_new();
                    //let ws = XLSX.utils.json_to_sheet(oDataExcel);
                    let ws = XLSX.utils.aoa_to_sheet(aRows);
                    var wscols = [{
                        wch: 20
                    }, {
                        wch: 20
                    }, {
                        wch: 20
                    }, {
                        wch: 40
                    }, {
                        wch: 30
                    }, {
                        wch: 20
                    }, {
                        wch: 20
                    }, {
                        wch: 40
                    },];
                    ws['!cols'] = wscols;
                    XLSX.utils.book_append_sheet(wb, ws, "Attributi");
                    XLSX.writeFile(wb, this.getView().getModel("i18n").getResourceBundle().getText("title2") + ".xlsx");
                    this.oComponent.resetAllBusy();
                }, oError => {
                    MessageToast.show(this.oComponent.i18n().getText("msg.error.zattributianagrafici.text"));
                    this.oComponent.resetAllBusy();
                });
            },
            onSalvaCopiaAttributi: function (oEvent) {
                this.oComponent.busy(true);
                const oAppModel = this.getView().getModel("appModel");
                var aSelezionati = oAppModel.getProperty("/CopiaSelezionati");
                var CopiaA = oAppModel.getProperty("/CopiaA");
                var CopiaDa = oAppModel.getProperty("/CopiaDa");
                var batchChanges = [];
                var sServiceUrl = "/sap/opu/odata/sap/ZATTRIBUTIANAGRAFICI_SRV/";
                var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
                if (CopiaA === "" || !CopiaA) {
                    sap.m.MessageToast.show("Selezionare specie di destinazione");
                } else {
                    const oFinalFilter = new Filter({
                        filters: [],
                        and: false
                    });

                    if (this.MapName.find(z => z.VALUE === this.Header.Zattr) !== undefined) {
                        var ZattrHead = this.MapName.find(z => z.VALUE === this.Header.Zattr).KEY;
                    }
                    aSelezionati.forEach(y => {
                        if (this.MapName1.find(z => z.VALUE === y.Zname) !== undefined) {
                            var ZattrPos1 = this.MapName1.find(z => z.VALUE === y.Zname).KEY;
                        }
                        let aNomeCampoFilter = [];
                        aNomeCampoFilter.push(new Filter("Zattr", FilterOperator.EQ, ZattrPos1));
                        aNomeCampoFilter.push(new Filter("Zvalue", FilterOperator.EQ, y.ZvalueInf));
                        aNomeCampoFilter.push(new Filter("ZattrHead", FilterOperator.EQ, ZattrHead));
                        aNomeCampoFilter.push(new Filter("ZvalueHead", FilterOperator.EQ, this.Header.Zvalue));
                        oFinalFilter.aFilters.push(new Filter({
                            filters: aNomeCampoFilter,
                            and: true
                        }));
                        var oDataPos1 = {};
                        oDataPos1.Zattr = ZattrHead;
                        oDataPos1.Zvalue = CopiaA;
                        oDataPos1.Zname = ZattrPos1;
                        oDataPos1.Zid = "001";
                        oDataPos1.ZvalueInf = y.ZvalueInf;
                        oDataPos1.Zdescr = y.Zdescr;
                        oDataPos1.ZdescrEst = y.ZdescrEst;
                        oDataPos1.Ernam = "";
                        oDataPos1.Erdat = null;
                        oDataPos1.Zernam = "";
                        oDataPos1.Zerdat = null;
                        oDataPos1.Zdel = "";
                        batchChanges.push(oDataModel.createBatchOperation("ZMM_ATTR_POS1CopySet", "POST", oDataPos1));
                    });
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
                        aResult.forEach(z => {
                            var oDataPos2 = {};
                            oDataPos2.Zattr = z.Zattr;
                            oDataPos2.ZattrHead = z.ZattrHead;
                            oDataPos2.ZdescrEst = z.ZdescrEst;
                            oDataPos2.Zvalue = z.Zvalue;
                            oDataPos2.ZvalueHead = CopiaA;
                            oDataPos2.Zname = z.Zname;
                            oDataPos2.Zid = "001";
                            oDataPos2.ZvalueInf = z.ZvalueInf;
                            oDataPos2.Zdescr = z.Zdescr;
                            oDataPos2.Ernam = "";
                            oDataPos2.Erdat = null;
                            oDataPos2.Zernam = "";
                            oDataPos2.Zerdat = null;
                            oDataPos2.Zdel = "";
                            batchChanges.push(oDataModel.createBatchOperation("ZMM_ATTR_POS2CopySet", "POST", oDataPos2));
                        });
                        oDataModel.addBatchChangeOperations(batchChanges);
                        oDataModel.submitBatch(function (data, responseProcess) {
                            sap.m.MessageToast.show("Successo");
                            this.oComponent.resetAllBusy();
                            this.onCloseCopiaAttributi();
                        }.bind(this),
                            function (err) {
                                sap.m.MessageToast.show("Errore");
                                this.oComponent.resetAllBusy();
                                this.onCloseCopiaAttributi();
                            });
                    }, oError => {
                        MessageToast.show(this.oComponent.i18n().getText("msg.error.zattributianagrafici.text"));
                        this.onCloseCopiaAttributi();
                        this.oComponent.resetAllBusy();
                    });
                }
            },
            onCloseCopiaAttributi: function () {
                this._CopiaAttributiHelpDialog.close();
                this._CopiaAttributiHelpDialog.destroy();
                this._CopiaAttributiHelpDialog = null;
            },
            onCopiaAttributi: function (oEvent) {
                var aSelezionati = [];
                if (this.TableResultPos1Filtered.length > 0) {
                    aSelezionati = this.TableResultPos1Filtered.filter(x => x.Changed === true);
                } else {
                    aSelezionati = this.TableResultPos1.filter(x => x.Changed === true);
                }
                if (aSelezionati.length > 0) {
                    this.oComponent.busy(true);
                    const oAppModel = this.getView().getModel("appModel");
                    oAppModel.setProperty("/CopiaDa", this.Header.Zvalue);
                    oAppModel.setProperty("/CopiaDaDescription", this.Header.Zdescr);
                    oAppModel.setProperty("/CopiaSelezionati", aSelezionati);
                    let aFilters = [];
                    aFilters.push(new Filter("Zattr", FilterOperator.EQ, "SPECIE"));
                    const oPromiseSpecie = new Promise((resolve, reject) => {
                        this.getView().getModel().read("/ZMM_ATTR_HEADSet", {
                            filters: [aFilters],
                            success: (aData) => {
                                resolve(aData.results);
                            },
                            error: (oError) => {
                                reject;
                            }
                        });
                    });
                    oPromiseSpecie.then(aResults => {
                        var ListaZvalue = [];
                        let aUniqueZvalue = [...new Set(aResults.map(item => item.Zvalue))];
                        aUniqueZvalue.forEach(x => {
                            var Find = aResults.find(y => y.Zvalue === x);
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
                        oAppModel.setProperty("/zcopiaspecie", ListaZvalue);
                        if (!this._CopiaAttributiHelpDialog) {
                            this._CopiaAttributiHelpDialog = sap.ui.xmlfragment("it.orogel.attributianagrafici.view.CopiaAttributi", this);
                            this.getView().addDependent(this._CopiaAttributiHelpDialog);
                        }
                        this._CopiaAttributiHelpDialog.open();
                        this.oComponent.resetAllBusy();
                    }, oError => {
                        sap.m.MessageToast.show("Errore recupero Specie");
                        this.oComponent.resetAllBusy();
                    });
                } else {
                    sap.m.MessageToast.show("Selezionare almeno un attributo");
                }
            },
            onValueHelpCopiaAttributi: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue(),
                    oView = this.getView();
                // create value help dialog
                this._pValueHelpDialog = Fragment.load({
                    id: "ZCopiaAttributi",
                    name: "it.orogel.attributianagrafici.view.VHDialogZCopiaAttributi",
                    controller: this
                }).then(function (oValueHelpDialog) {
                    oView.addDependent(oValueHelpDialog);
                    return oValueHelpDialog;
                });
                this._pValueHelpDialog.then(function (oValueHelpDialog) {
                    oValueHelpDialog.getBinding("items").filter([new Filter("Value", FilterOperator.Contains, sInputValue)]);
                    oValueHelpDialog.open(sInputValue);
                });
            },
            onVHDialogZCopiaAttributiClose: function (oEvent) {
                var aSelectedItems = oEvent.getParameter("selectedItems");
                if (aSelectedItems && aSelectedItems.length > 0) {
                    const oAppModel = this.getView().getModel("appModel");
                    var aSelezionato = aSelectedItems[0].getTitle().split(" | ");
                    oAppModel.setProperty("/CopiaA", aSelezionato[0]);
                    oAppModel.setProperty("/CopiaADescription", aSelezionato[1]);
                }
            },
            onSearchZCopiaAttributi: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter({
                    filters: [
                        new Filter("Value", FilterOperator.Contains, sValue),
                        new Filter("Descrizione", FilterOperator.Contains, sValue)
                    ],
                    and: false
                });
                var oBinding = oEvent.getParameter("itemsBinding");
                oBinding.filter([oFilter]);
            }
        });
        /**
        * Set table model 
        * ---------------
        * @param aProducts - products
        * @private
        */
        oAppController.prototype._setTableModel = function (aResults) {
            if (this.TableResultPos1.length === 0 && this.RowInsertedPos1.length === 0) {
                this.TableResultPos1 = aResults;
            }
            //set model: concat new batch of data to previous model
            const oAppModel = this.getView().getModel("appModel");
            const oTable = this.getView().byId("attTableIdPos1");
            oAppModel.setProperty("/rows1", aResults);
            oTable.setModel(oAppModel);
            oTable.bindRows("/rows1");
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
            this.RowInsertedPos1.forEach(x => {
                x.ZvalueInf = x.ZvalueInf.toUpperCase();
                x.Zvalue = x.Zvalue.toUpperCase();
                if (x.Zname === "" || x.ZvalueInf === "") {
                    Errori = Errori + "Valorizzare i campi obbligatori\n";
                }
                var ZnameKey = "";
                if (this.MapName1.find(y => y.VALUE === x.Zname) !== undefined) {
                    ZnameKey = this.MapName1.find(y => y.VALUE === x.Zname).KEY;
                }
                if (MapDescrizione.find(y => y.Zattr === ZnameKey) !== undefined) {
                    if (MapDescrizione.find(y => y.Zattr === ZnameKey).Zlung < x.Zdescr.length) {
                        Errori = Errori + "Descrizione breve non ammessa perchè troppo lunga per " + x.Zattr + " " + x.Zvalue + " " + x.Zname + " " + x.Zid + " " + x.ZvalueInf + ".Il numero massimo di caratteri è" + MapDescrizione.find(y => y.Zattr === ZnameKey).Zlung + "\n";
                    }
                }
                if (this.MapName1.find(y => y.VALUE === x.Zname) !== undefined) {
                    /*if (this.MapName1.find(y => y.VALUE === x.Zname).LENGTH < x.ZvalueInf.length) {
                        Errori = Errori + "Valore non ammesso perchè troppo lungo per " + x.Zattr + " " + x.Zvalue + " " + x.Zname + " " + x.Zid + " " + x.ZvalueInf + "\n";
                    }*/
                    if (this.MapName1.find(y => y.VALUE === x.Zname).LENGTH !== x.ZvalueInf.length) {
                        Errori = Errori + "Il codice inserito non è della lunghezza corretta per " + x.Zattr + " " + x.Zvalue + " " + x.Zname + " " + x.Zid + " " + x.ZvalueInf + "\n";
                    }
                }
                var find = this.TableResultPos1.find(y => y.Zattr === x.Zattr && y.Zvalue === x.Zvalue && y.Zname === x.Zname && y.Zid === x.Zid && y.ZvalueInf === x.ZvalueInf);
                if (find !== undefined) {
                    Errori = Errori + "Chiave già esistente a sistema: " + x.Zattr + " " + x.Zvalue + " " + x.Zname + " " + x.Zid + " " + x.ZvalueInf + "\n";
                }
            });
            if (Errori === "") {
                if (this.TableResultPos1Filtered.length > 0) {
                    for (var i = 0; i < this.TableResultPos1Filtered.length; i++) {
                        if (this.TableResultPos1Filtered[i].Zdel === true) {
                            this.TableResultPos1Filtered[i].Zdel = "X";
                        } else if (this.TableResultPos1Filtered[i].Zdel === false) {
                            this.TableResultPos1Filtered[i].Zdel = "";
                        }
                        delete this.TableResultPos1Filtered[i].editable;
                        delete this.TableResultPos1Filtered[i].NewRow;
                        delete this.TableResultPos1Filtered[i].Changed;
                        if (this.CBOPos1[i].Zdel === false) {
                            this.CBOPos1[i].Zdel = "";
                        } else if (this.CBOPos1[i].Zdel === true) {
                            this.CBOPos1[i].Zdel = "X";
                        }
                        delete this.CBOPos1[i].editable;
                        delete this.CBOPos1[i].NewRow;
                        delete this.CBOPos1[i].Changed;
                        if (JSON.stringify(this.TableResultPos1Filtered[i]) !== JSON.stringify(this.CBOPos1[i])) {
                            this.RowModifyPos1.push(this.TableResultPos1Filtered[i]);
                        }
                    }
                } else {
                    for (var i = 0; i < this.TableResultPos1.length; i++) {
                        if (this.TableResultPos1[i].Zdel === true) {
                            this.TableResultPos1[i].Zdel = "X";
                        } else if (this.TableResultPos1[i].Zdel === false) {
                            this.TableResultPos1[i].Zdel = "";
                        }
                        delete this.TableResultPos1[i].editable;
                        delete this.TableResultPos1[i].NewRow;
                        delete this.TableResultPos1[i].Changed;
                        if (this.CBOPos1[i].Zdel === false) {
                            this.CBOPos1[i].Zdel = "";
                        } else if (this.CBOPos1[i].Zdel === true) {
                            this.CBOPos1[i].Zdel = "X";
                        }
                        delete this.CBOPos1[i].editable;
                        delete this.CBOPos1[i].NewRow;
                        delete this.CBOPos1[i].Changed;
                        if (JSON.stringify(this.TableResultPos1[i]) !== JSON.stringify(this.CBOPos1[i])) {
                            this.RowModifyPos1.push(this.TableResultPos1[i]);
                        }
                    }
                }
            }
            return Errori;
        };
        oAppController.prototype.insertHeader = function () {
            var headerRow = [];
            headerRow = [{
                v: 'Nome Attributo',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            },
            {
                v: 'Voce Attributo',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }, {
                v: 'DESCRIZIONE',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }, {
                v: 'DESCRIZIONE ESTESA',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }, {
                v: '',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment,

                }
            }, {
                v: '',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }
            ];
            return headerRow;
        };
        oAppController.prototype.insertHeaderRow = function () {
            var headerRow = [];
            headerRow = [{
                v: this.Header.Zattr,
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            },
            {
                v: this.Header.Zvalue,
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }, {
                v: this.Header.Zdescr,
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }, {
                v: this.Header.ZdescrEst,
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }, {
                v: '',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment,

                }
            }, {
                v: '',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }
            ];
            return headerRow;
        };
        oAppController.prototype.insertPos = function () {
            var headerRow = [];
            headerRow = [{
                v: 'Nome Attr. Correlato 1° livello',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            },
            {
                v: 'Valore Attr. 1° livello',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }, {
                v: 'Descrizione Attributo',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }, {
                v: 'Nome Attr. Correlato 2° livello',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }, {
                v: 'Valore Attr. 2° livello',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment,

                }
            }, {
                v: 'Descrizione Attributo',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }
            ];
            return headerRow;
        };
        oAppController.prototype.insertPosRow0 = function (z) {
            var headerRow = [];
            headerRow = [{
                v: z.NomeAttributoCorrelato,
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            },
            {
                v: z.ValoreAttributoPosizione,
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }, {
                v: z.DescrizioneAttributo,
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }, {
                v: z.DescrizioneEstesaAttributo,
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }, {
                v: '',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment,

                }
            }, {
                v: '',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }
            ];
            return headerRow;
        };
        oAppController.prototype.insertPosRow = function (z, b) {
            var headerRow = [];
            var sName = "";
            if (this.MapName1.find(a => a.KEY === b.Zname) !== undefined) {
                sName = this.MapName1.find(a => a.KEY === b.Zname).VALUE;
            }
            headerRow = [{
                v: z.NomeAttributoCorrelato,
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            },
            {
                v: z.ValoreAttributoPosizione,
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }, {
                v: z.DescrizioneAttributo,
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }, {
                v: z.DescrizioneEstesaAttributo,
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }, {
                v: sName,
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }, {
                v: b.ZvalueInf,
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment,

                }
            }, {
                v: b.Zdescr,
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }, {
                v: b.ZdescrEst,
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }
            ];
            return headerRow;
        };
        oAppController.prototype.insertPos = function () {
            var headerRow = [];
            headerRow = [{
                v: 'Nome Attr. Correlato 1° livello',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            },
            {
                v: 'Valore Attr. 1° livello',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }, {
                v: 'Descrizione Attributo',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }, {
                v: 'Descrizione Estesa Attributo',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }, {
                v: 'Nome Attr. Correlato 2° livello',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }, {
                v: 'Valore Attr. 2° livello',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment,

                }
            }, {
                v: 'Descrizione Attributo',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }, {
                v: 'Descrizione Estesa Attributo',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }
            ];
            return headerRow;
        };
        oAppController.prototype.insertSpace = function () {
            var headerRow = [];
            headerRow = [{
                v: '',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            },
            {
                v: '',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }, {
                v: '',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }, {
                v: '',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }, {
                v: '',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment,

                }
            }, {
                v: '',
                s: {
                    font: Constants.Style.HEADER.font,
                    border: Constants.Style.HEADER.border,
                    alignment: Constants.Style.HEADER.alignment
                }
            }
            ];
            return headerRow;
        };
        return oAppController;
    }); 