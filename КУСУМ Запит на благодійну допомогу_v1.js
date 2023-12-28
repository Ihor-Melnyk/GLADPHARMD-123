function setPropertyDisabled(attributeName, boolValue = true) {
  //недоступне
  var attributeProps = EdocsApi.getControlProperties(attributeName);
  attributeProps.disabled = boolValue;
  EdocsApi.setControlProperties(attributeProps);
}

function setPropertyHidden(attributeName, boolValue = true) {
  //приховане
  var attributeProps = EdocsApi.getControlProperties(attributeName);
  attributeProps.hidden = boolValue;
  EdocsApi.setControlProperties(attributeProps);
}

function clearAttribute(attributeCode, doNotClearOnInit, isDictionary) {
  //очищення
  if (doNotClearOnInit) {
    return;
  }
  var attribute = EdocsApi.getAttributeValue(attributeCode);
  attribute.value = null;
  attribute.text = null;
  if (isDictionary) {
    attribute.itemCode = null;
    attribute.itemDictionary = null;
  }
  EdocsApi.setAttributeValue(attribute);
}

//1.Зміна властивостей атрибутів
function setPropcounterparty() {
  debugger;
  if (EdocsApi.getAttributeValue("CreateCounterparty").value === "true") {
    EdocsApi.setControlProperties({ code: "counterparty", hidden: false, disabled: true, required: false });
    EdocsApi.setControlProperties({ code: "counterpartyCodenew", hidden: false, disabled: false, required: true });
    EdocsApi.setControlProperties({ code: "counterpartyNamenew", hidden: false, disabled: false, required: true });
    EdocsApi.setControlProperties({ code: "counterpartyFullName", hidden: false, disabled: false, required: true });
    EdocsApi.setControlProperties({ code: "PayerVAT", hidden: false, disabled: false, required: true });
    EdocsApi.setControlProperties({ code: "counterpartyTaxStatus", hidden: false, disabled: false, required: true });
    EdocsApi.setControlProperties({ code: "counterpartyVatNumber", hidden: false, disabled: false, required: false });
    EdocsApi.setControlProperties({ code: "counterpartyOwnershipType", hidden: false, disabled: true, required: true });
    EdocsApi.setControlProperties({ code: "counterpartyLegalAddress", hidden: false, disabled: false, required: true });
    EdocsApi.setControlProperties({ code: "counterpartyEmail", hidden: false, disabled: false, required: false });
    EdocsApi.setControlProperties({ code: "counterpartyPhone", hidden: false, disabled: false, required: false });
    EdocsApi.setControlProperties({ code: "TableOrganizationAccountNumber", hidden: false, disabled: false, required: false });
    EdocsApi.setControlProperties({ code: "OrganizationAccountNumber", hidden: false, disabled: false, required: true });
    EdocsApi.setControlProperties({ code: "OrganizationBankName", hidden: false, disabled: false, required: false });
    EdocsApi.setControlProperties({ code: "MFO", hidden: false, disabled: false, required: true });
    EdocsApi.setControlProperties({ code: "Сurrency", hidden: false, disabled: true, required: true });
    EdocsApi.setControlProperties({ code: "stateProp", hidden: false, disabled: false, required: false });
  } else {
    if (CurrentDocument.isDraft) {
      clearAttribute("counterparty");
      clearAttribute("counterpartyCodenew");
      clearAttribute("counterpartyNamenew");
      clearAttribute("counterpartyFullName");
      clearAttribute("PayerVAT");
      clearAttribute("counterpartyTaxStatus");
      clearAttribute("counterpartyVatNumber");
      clearAttribute("counterpartyOwnershipType");
      clearAttribute("counterpartyLegalAddress");
      clearAttribute("counterpartyEmail");
      clearAttribute("counterpartyPhone");
      clearAttribute("TableOrganizationAccountNumber");
      clearAttribute("OrganizationAccountNumber");
      clearAttribute("OrganizationBankName");
      clearAttribute("MFO");
      clearAttribute("Сurrency");
      clearAttribute("stateProp");
    }
    EdocsApi.setControlProperties({ code: "counterparty", hidden: false, disabled: false, required: true });
    EdocsApi.setControlProperties({ code: "counterpartyCodenew", hidden: true, disabled: true, required: false });
    EdocsApi.setControlProperties({ code: "counterpartyNamenew", hidden: true, disabled: true, required: false });
    EdocsApi.setControlProperties({ code: "counterpartyFullName", hidden: true, disabled: true, required: false });
    EdocsApi.setControlProperties({ code: "PayerVAT", hidden: true, disabled: true, required: false });
    EdocsApi.setControlProperties({ code: "counterpartyTaxStatus", hidden: true, disabled: true, required: false });
    EdocsApi.setControlProperties({ code: "counterpartyVatNumber", hidden: true, disabled: true, required: false });
    EdocsApi.setControlProperties({ code: "counterpartyOwnershipType", hidden: true, disabled: true, required: false });
    EdocsApi.setControlProperties({ code: "counterpartyLegalAddress", hidden: true, disabled: true, required: false });
    EdocsApi.setControlProperties({ code: "counterpartyEmail", hidden: true, disabled: true, required: false });
    EdocsApi.setControlProperties({ code: "counterpartyPhone", hidden: true, disabled: true, required: false });
    EdocsApi.setControlProperties({ code: "TableOrganizationAccountNumber", hidden: true, disabled: true, required: false });
    EdocsApi.setControlProperties({ code: "OrganizationAccountNumber", hidden: true, disabled: true, required: false });
    EdocsApi.setControlProperties({ code: "OrganizationBankName", hidden: true, disabled: true, required: false });
    EdocsApi.setControlProperties({ code: "MFO", hidden: true, disabled: true, required: false });
    EdocsApi.setControlProperties({ code: "Сurrency", hidden: true, disabled: true, required: false });
    EdocsApi.setControlProperties({ code: "stateProp", hidden: true, disabled: true, required: false });
  }
}

function onChangeCreateCounterparty() {
  setPropcounterparty();
  setcounterpartyOwnershipType();
}

function onCardInitialize() {
  onChangeCreateCounterparty();
  setPropregistration();
  setPropCreateCounterparty();
}

//2. Створення нового контрагента в шині
function onTaskExecuteChecknewCounterparty(routeStage) {
  if (routeStage.executionResult == "executed") {
    var method = "edocsCreateDoc";
    var methodData = {
      createdById: EdocsApi.getEmployeeDataByEmployeeID(CurrentDocument.initiatorId).extId,
      externalDocId: CurrentDocument.id.toString(),
      inMessageCaseType: "contractor",
      attributeValues: [],
      tableAttributes: [],
    };

    methodData.attributeValues.push({ code: "edrpou", value: EdocsApi.getAttributeValue("counterpartyCodenew").value || "" });
    methodData.attributeValues.push({ code: "shortName", value: EdocsApi.getAttributeValue("counterpartyNamenew").value });
    methodData.attributeValues.push({ code: "fullName", value: EdocsApi.getAttributeValue("counterpartyFullName").value });
    methodData.attributeValues.push({ code: "payerVAT", value: EdocsApi.getAttributeValue("PayerVAT").value == "Ні" ? false : true });
    methodData.attributeValues.push({ code: "taxPayerStatus", value: EdocsApi.getAttributeValue("counterpartyTaxStatus").value });
    methodData.attributeValues.push({ code: "rnokpp", value: EdocsApi.getAttributeValue("counterpartyVatNumber").value });
    methodData.attributeValues.push({ code: "typeOfOwnership", value: setTypeOfOwnership(EdocsApi.getAttributeValue("counterpartyOwnershipType").value) });
    methodData.attributeValues.push({ code: "legalAddress", value: EdocsApi.getAttributeValue("counterpartyLegalAddress").value });
    methodData.attributeValues.push({ code: "Email", value: EdocsApi.getAttributeValue("counterpartyEmail").value });
    methodData.attributeValues.push({ code: "Phone", value: EdocsApi.getAttributeValue("counterpartyPhone").value });
    methodData.attributeValues.push({ code: "stateProp", value: EdocsApi.getAttributeValue("stateProp").value });
    //Tables
    methodData.tableAttributes.push({ code: "accounts", value: getAccountsTable(EdocsApi.getAttributeValue("TableOrganizationAccountNumber").value) });

    //відправка в зонішню систему 1С
    debugger;
    var response = EdocsApi.runExternalFunction("1C", method, methodData);

    if (response.data) {
      if (response.data.docId) {
        EdocsApi.message("Запис успішно створений. Ідентифікатор: " + response.data.docId);
        EdocsApi.setAttributeValue({ code: "counterpartyId", value: response.data.docId + "|creditor" });
        onChangecounterpartyId();
      } else if (response.data.error) {
        if (response.data.error.validationErrors && response.data.error.validationErrors.length > 0) {
          var errorMessage = "";
          for (var i = 0; i < response.data.error.validationErrors.length; i++) {
            errorMessage += response.data.error.validationErrors[i].message + "; ";
          }
          throw response.data.error.details + "  -  " + errorMessage;
        }
      } else {
        throw "Не отримано відповіді від шини";
      }
    } else {
      throw "Не отримано відповіді від шини";
    }
  }
}

function getAccountsTable(accounts) {
  var result = [];
  if (accounts && accounts.length > 0) {
    accounts.forEach((account) => {
      result.push([
        { code: "number", value: EdocsApi.findElementByProperty("code", "OrganizationAccountNumber", account)?.value },
        { code: "bank", value: EdocsApi.findElementByProperty("code", "OrganizationBankName", account)?.value },
        { code: "ift", value: EdocsApi.findElementByProperty("code", "MFO", account)?.value },
        { code: "currency", value: EdocsApi.findElementByProperty("code", "Сurrency", account)?.itemCode },
      ]);
    });
  }
  return result;
}

function setTypeOfOwnership(typeOfOwnership) {
  debugger;
  switch (typeOfOwnership) {
    case "Юридична особа":
      return "LEGAL_ENTITY";
    case "Фізична особа-підприємець":
      return "ENTREPRENEUR";
    case "Приватна особа":
      return "PERSON";
    case "LEGAL_ENTITY":
      return "Юридична особа";
    case "ENTREPRENEUR":
      return "Фізична особа-підприємець";
    case "PERSON":
      return "Приватна особа";

    default:
      return null;
  }
}

//3. Автозаповнення атрибутів «Форма власності» та «Валюта»
function setcounterpartyOwnershipType() {
  if (EdocsApi.getAttributeValue("CreateCounterparty").value === "true") {
    EdocsApi.setAttributeValue({ code: "counterpartyOwnershipType", value: "Юридична особа", text: null });
  }
}

function onRowOpenTableOrganizationAccountNumber() {
  if (EdocsApi.getAttributeValue("CreateCounterparty").value === "true") {
    EdocsApi.setAttributeValue({ code: "Сurrency", value: "1", text: "UAH", itemCode: "980", itemDictionary: "Currency" });
  }
}

//4. Автозаповнення контрагента із зовнішнього довідника
function onChangecounterpartyId() {
  debugger;
  var counterpartyId = EdocsApi.getAttributeValue("counterpartyId");

  if (counterpartyId.value) {
    var ContractorData = EdocsApi.runExternalFunction("Contractors", "edocsGETCONTRACTOR?format=json&CONTRACTORID=" + counterpartyId.value + "&CONTRACTORTYPE=2" + "&MAXRESULTCOUNT=200", null, "get");

    EdocsApi.setAttributeValue({ code: "counterpartyCode", value: ContractorData.data.Code });
    EdocsApi.setAttributeValue({ code: "counterpartyName", value: ContractorData.data.ShortName });
    setPropertyHidden("CreateCounterparty", false);
    setPropertyDisabled("CreateCounterparty");
  } else {
    clearAttribute("counterpartyCode");
    clearAttribute("counterpartyName");
  }
}

function onSearchcounterparty(request) {
  request.filterCollection.push({ attributeCode: "ContractorType", value: "Creditor" });
}

function setPropregistration() {
  if (CurrentUser.employeeId == "15") {
    setPropertyHidden("registration", false);
  } else {
    setPropertyHidden("registration");
  }
}

function setPropCreateCounterparty() {
  if (EdocsApi.getAttributeValue("counterpartyId").value) {
    setPropertyDisabled("CreateCounterparty");
  } else {
    if (CurrentDocument.isDraft) {
      setPropertyDisabled("CreateCounterparty", false);
    }
  }
}

function onChangecounterparty() {
  if (EdocsApi.getAttributeValue("counterparty").value) {
    setPropertyHidden("CreateCounterparty");
  } else {
    setPropertyHidden("CreateCounterparty", false);
    setPropertyDisabled("CreateCounterparty", false);
  }
}
