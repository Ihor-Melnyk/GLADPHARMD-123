// Погодження контрагента Кусум ТЕСТ

function onCreate() {
  //EdocsApi.setAttributeValue({code: 'guid', value: generateGuid()})
}

function onCardInitialize() {
  debugger;
  onChangecounterpartyOwnershipType(true);
  //onChangecounterpartyTaxStatus(true);
  onChangeDocKind(true);
  //onChangeContractorIsResident();
  onChangePayerVAT(true);

  var DocKind = EdocsApi.getAttributeValue("DocKind");
  if (DocKind.text == "Заявка на внесення змін") {
    onChangeChangeAccountNumber();
    onChangeChangeName();
    onChangeChangeadditionalInfo();
    onChangeChangeCertificateNumber();
    onChangeChangeContacts();
    onChangeChangeEmail();
    onChangeChangeLegalAddress();
    onChangeChangeManager();
    onChangeChangePostalAddress();
    onChangeChangeTaxStatus();
    onChangeChangeIdDocuments();
    onChangeChangeVat();
  }
}

function onChangeMFO() {
  if (CurrentDocument.isDraft) {
    var MFO = EdocsApi.getAttributeValue("MFO").value;
    if (MFO) {
      if (MFO.length > 20 || MFO.replace(/[0-9]/g, "")) {
        EdocsApi.message("Поле МФО може містити лише цифрове значення не більше 20 символів. Перевірте коректність");

        EdocsApi.setAttributeValue({ code: "MFO", value: MFO.replace(/\D/g, "").slice(0, 20), text: null });
      }
    }
  }
}

function onBeforeCardSave() {
  if (CurrentDocument.isDraft) {
    if (EdocsApi.getAttributeValue("DocKind").text == "Заявка на додавання") {
      var counterpartyCode = EdocsApi.getAttributeValue("counterpartyCode");

      if (counterpartyCode.value) {
        getConterpatyFromDirectory(counterpartyCode.value);
      }
    }
  }
  if (EdocsApi.getAttributeValue("DocKind").text == "Заявка на внесення змін") {
    auditCounterpartyManagerTable();
  }
}

function auditCounterpartyManagerTable() {
  var table = EdocsApi.getAttributeValue("counterpartyManagerTable").value;
  if (table && table.length > 0) {
    if (
      table
        .flat()
        .filter((x) => x.value == null || x.value == "")
        .find((y) => y.code == "counterpartyManagerEmail" || y.code == "counterpartyManagerPhone" || y.code == "counterpartyManagerName" || y.code == "counterpartyManagerPosition")
    )
      throw "Перевірте заповнення обов’язкових полів Таблиці Менеджери контрагентів";
  }
}

function clearAttribute(attributeCode, doNotClearOnInit, isDictionary) {
  //очищення
  debugger;
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

function setPropertyRequired(attributeName, boolValue) {
  //обов"язкове
  var attributeProps = EdocsApi.getControlProperties(attributeName);
  attributeProps.required = boolValue;
  EdocsApi.setControlProperties(attributeProps);
}

function setPropertyHidden(attributeName, boolValue) {
  //приховане
  var attributeProps = EdocsApi.getControlProperties(attributeName);
  attributeProps.hidden = boolValue;
  EdocsApi.setControlProperties(attributeProps);
}

function setPropertyDisabled(attributeName, boolValue) {
  //недоступне
  var attributeProps = EdocsApi.getControlProperties(attributeName);
  attributeProps.disabled = boolValue;
  EdocsApi.setControlProperties(attributeProps);
}

function onButtonPushgetEDRDataButton() {
  var counterpartyCode = EdocsApi.getAttributeValue("counterpartyCode");

  if (counterpartyCode.value) {
    getConterpatyFromDirectory(counterpartyCode.value);
    var counterpartyData = EdocsApi.getEdrLegalEntityItems(counterpartyCode.value);
    if (counterpartyData) {
      EdocsApi.setAttributeValue({ code: "counterpartyName", value: counterpartyData.shortName });
      EdocsApi.setAttributeValue({ code: "counterpartyFullName", value: counterpartyData.name });
      EdocsApi.setAttributeValue({ code: "counterpartyLegalAddress", value: counterpartyData.address });
    }
  } else {
    throw "Не зазначено код ЄДРПОУ";
  }
}

function getConterpatyFromDirectory(code) {
  try {
    var conterparty = EdocsApi.getContractorByCode(code, "creditor") || EdocsApi.getContractorByCode(code, "debtor");
    if (conterparty && EdocsApi.getAttributeValue("DocKind").text == "Заявка на додавання") {
      EdocsApi.message("Зверніть увагу! Контрагент з таким ЄДРПОУ вже існує в системі. " + conterparty.code + " " + conterparty.fullName);
    }
    /*else if(EdocsApi.getAttributeValue("DocKind").text == "Заявка на додавання"){
          EdocsApi.message('Контрагента немає в системі');
        }*/
  } catch (e) {}
}

/*function generateGuid() {
      var guid = EdocsApi.getAttributeValue('guid');
      if (!guid.value) {
          var dt = new Date().getTime();
          var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = (dt + Math.random()*16)%16 | 0;
          dt = Math.floor(dt/16);
          return (c=='x' ? r :(r&0x3|0x8)).toString(16);
      });
      return uuid;
      }
  }*/

function onChangecounterpartyOwnershipType(doNotClearOnInit) {
  var counterpartyOwnershipType = EdocsApi.getAttributeValue("counterpartyOwnershipType");

  if (counterpartyOwnershipType.value && (counterpartyOwnershipType.value == "Фізична особа-підприємець" || counterpartyOwnershipType.value == "Приватна особа")) {
    EdocsApi.setControlProperties({ code: "counterpartyIdDocuments", hidden: false, required: true });
  } else {
    EdocsApi.setControlProperties({ code: "counterpartyIdDocuments", hidden: true, required: false });
    clearAttribute("counterpartyIdDocuments", doNotClearOnInit);
  }
}

/*function onChangecounterpartyTaxStatus(doNotClearOnInit){
      var counterpartyTaxStatus = EdocsApi.getAttributeValue('counterpartyTaxStatus');
  
      if (counterpartyTaxStatus.value) {
          if (counterpartyTaxStatus.value == 'Платник єдиного податку') {
              EdocsApi.setControlProperties({code: 'counterpartyTaxStatusAddInfo', hidden: false, required: true});
          } else {
              EdocsApi.setControlProperties({code: 'counterpartyTaxStatusAddInfo', hidden: true, required: false});
              clearAttribute('counterpartyTaxStatusAddInfo', doNotClearOnInit);
          }
      }
  }*/

function onTaskExecutecreateCTRPT(routeStage) {
  if (routeStage.executionResult == "executed") {
    var method = "edocsCreateDoc";
    var methodData = {
      createdById: EdocsApi.getEmployeeDataByEmployeeID(CurrentDocument.initiatorId).extId,
      externalDocId: CurrentDocument.id.toString(),
      inMessageCaseType: "contractor",
      attributeValues: [],
      tableAttributes: [],
    };
    var counterpartyOwnershipType = EdocsApi.getAttributeValue("counterpartyOwnershipType");

    methodData.attributeValues.push({ code: "createdById", value: EdocsApi.getEmployeeDataByEmployeeID(CurrentDocument.initiatorId).extId });

    methodData.attributeValues.push({ code: "shortName", value: EdocsApi.getAttributeValue("counterpartyName").value });
    methodData.attributeValues.push({ code: "foreignShortName", value: EdocsApi.getAttributeValue("foreignShortName").value });
    methodData.attributeValues.push({ code: "fullName", value: EdocsApi.getAttributeValue("counterpartyFullName").value });
    methodData.attributeValues.push({ code: "foreignFullName", value: EdocsApi.getAttributeValue("foreignFullName").value });
    methodData.attributeValues.push({ code: "edrpou", value: EdocsApi.getAttributeValue("counterpartyCode").value || "" });
    methodData.attributeValues.push({ code: "rnokpp", value: EdocsApi.getAttributeValue("counterpartyVatNumber").value });
    methodData.attributeValues.push({ code: "idDocument", value: EdocsApi.getAttributeValue("counterpartyIdDocuments").value });
    methodData.attributeValues.push({ code: "vatNumber", value: EdocsApi.getAttributeValue("CertificateNumber").value });
    methodData.attributeValues.push({ code: "typeOfOwnership", value: setTypeOfOwnership(counterpartyOwnershipType.value) });
    methodData.attributeValues.push({ code: "isDomestic", value: "false" });
    //methodData.attributeValues.push({ "code": "counterpartyTaxStatusAddInfo", "value": EdocsApi.getAttributeValue('counterpartyTaxStatusAddInfo').value });
    methodData.attributeValues.push({ code: "payerVAT", value: EdocsApi.getAttributeValue("PayerVAT").value == "Ні" ? false : true });
    methodData.attributeValues.push({ code: "nonResident", value: EdocsApi.getAttributeValue("ContractorIsResident").value == "false" ? false : true });
    methodData.attributeValues.push({ code: "taxPayerStatus", value: EdocsApi.getAttributeValue("counterpartyTaxStatus").value });
    methodData.attributeValues.push({ code: "legalAddress", value: EdocsApi.getAttributeValue("counterpartyLegalAddress").value });
    methodData.attributeValues.push({ code: "status", value: "ACTIVE" });
    methodData.attributeValues.push({ code: "countryId", value: "UA" });
    methodData.attributeValues.push({ code: "information", value: EdocsApi.getAttributeValue("additionalInfo").value });
    methodData.attributeValues.push({ code: "stateProp", value: EdocsApi.getAttributeValue("stateProp").value == "Ні" ? false : true });

    //Tables
    methodData.tableAttributes.push({ code: "accounts", value: getAccountsTable(EdocsApi.getAttributeValue("TableOrganizationAccountNumber").value, method) });
    methodData.tableAttributes.push({ code: "persons", value: getPersonsTable(EdocsApi.getAttributeValue("counterpartyContactsTable").value, method) });
    methodData.tableAttributes.push({ code: "contacts", value: getContactsTable(method) });
    methodData.tableAttributes.push({ code: "addresses", value: getPostalAddressesTable(EdocsApi.getAttributeValue("TableСounterpartyPostalAddress").value, method) });
    methodData.tableAttributes.push({ code: "managers", value: getСontactsManager(EdocsApi.getAttributeValue("counterpartyManagerTable").value, method) });

    var response = EdocsApi.runExternalFunction("1C", method, methodData);

    if (response.data) {
      if (response.data.docId) {
        EdocsApi.message("Запис успішно створений. Ідентифікатор:" + response.data.docId);
        EdocsApi.setAttributeValue({ code: "guid", value: response.data.docId });
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

function onTaskExecuteUpdateCTRPT(routeStage) {
  if (routeStage.executionResult == "executed") {
    var ctrptId = EdocsApi.getAttributeValue("ContractorID").value;
    var method = "edocsUpdateDoc";
    var methodData = {
      initiatorId: EdocsApi.getEmployeeDataByEmployeeID(CurrentDocument.initiatorId).extId,
      externalDocId: ctrptId /*CurrentDocument.id.toString()*/,
      /*docId: EdocsApi.getAttributeValue('ContractorID').value,*/
      inMessageCaseType: "contractor",
      attributeValues: [],
      tableAttributes: [],
    };
    var counterpartyOwnershipType = EdocsApi.getAttributeValue("counterpartyOwnershipType");

    methodData.attributeValues.push({ code: "id", value: ctrptId });
    methodData.attributeValues.push({ code: "createdById", value: EdocsApi.getEmployeeDataByEmployeeID(CurrentDocument.initiatorId).extId });

    methodData.attributeValues.push({ code: "shortName", value: EdocsApi.getAttributeValue("counterpartyName").value });
    methodData.attributeValues.push({ code: "foreignShortName", value: EdocsApi.getAttributeValue("foreignShortName").value });
    methodData.attributeValues.push({ code: "fullName", value: EdocsApi.getAttributeValue("counterpartyFullName").value });
    methodData.attributeValues.push({ code: "foreignFullName", value: EdocsApi.getAttributeValue("foreignFullName").value });
    methodData.attributeValues.push({ code: "edrpou", value: EdocsApi.getAttributeValue("counterpartyCode").value || "" });
    methodData.attributeValues.push({ code: "rnokpp", value: EdocsApi.getAttributeValue("counterpartyVatNumber").value });
    methodData.attributeValues.push({ code: "idDocument", value: EdocsApi.getAttributeValue("counterpartyIdDocuments").value });
    methodData.attributeValues.push({ code: "vatNumber", value: EdocsApi.getAttributeValue("CertificateNumber").value });
    methodData.attributeValues.push({ code: "typeOfOwnership", value: setTypeOfOwnership(counterpartyOwnershipType.value) });
    methodData.attributeValues.push({ code: "isDomestic", value: "false" });
    //methodData.attributeValues.push({ "code": "counterpartyTaxStatusAddInfo", "value": EdocsApi.getAttributeValue('counterpartyTaxStatusAddInfo').value });
    methodData.attributeValues.push({ code: "payerVAT", value: EdocsApi.getAttributeValue("PayerVAT").value == "Ні" ? false : true });
    methodData.attributeValues.push({ code: "nonResident", value: EdocsApi.getAttributeValue("ContractorIsResident").value == "false" ? false : true });
    methodData.attributeValues.push({ code: "taxPayerStatus", value: EdocsApi.getAttributeValue("counterpartyTaxStatus").value });
    methodData.attributeValues.push({ code: "legalAddress", value: EdocsApi.getAttributeValue("counterpartyLegalAddress").value });
    methodData.attributeValues.push({ code: "status", value: "ACTIVE" });
    methodData.attributeValues.push({ code: "countryId", value: "UA" });
    methodData.attributeValues.push({ code: "information", value: EdocsApi.getAttributeValue("additionalInfo").value });
    methodData.attributeValues.push({ code: "stateProp", value: EdocsApi.getAttributeValue("stateProp").value == "Ні" ? false : true });
    //Tables
    methodData.tableAttributes.push({ code: "accounts", value: getAccountsTable(EdocsApi.getAttributeValue("TableOrganizationAccountNumber").value, method, ctrptId) });
    methodData.tableAttributes.push({ code: "persons", value: getPersonsTable(EdocsApi.getAttributeValue("counterpartyContactsTable").value, method, ctrptId) });
    methodData.tableAttributes.push({ code: "contacts", value: getContactsTable(method, ctrptId) });
    methodData.tableAttributes.push({ code: "addresses", value: getPostalAddressesTable(EdocsApi.getAttributeValue("TableСounterpartyPostalAddress").value, method, ctrptId) });
    methodData.tableAttributes.push({ code: "managers", value: getContactsManager(EdocsApi.getAttributeValue("counterpartyManagerTable").value, method, ctrptId) });

    var response = EdocsApi.runExternalFunction("1C", method, methodData);

    if (response.data) {
      if (response.data.docId) {
        if (response.data.docId == EdocsApi.getAttributeValue("ContractorID").value) {
          EdocsApi.message("Запис успішно оновлено");
        } else {
          throw "Помилка оновлення запису";
        }
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

function getAccountsTable(accounts, method, ctrptId) {
  var result = [];
  if (accounts && accounts.length > 0) {
    if (method == "edocsCreateDoc") {
      accounts.forEach((account) => {
        result.push([
          { code: "number", value: EdocsApi.findElementByProperty("code", "OrganizationAccountNumber", account)?.value },
          { code: "bank", value: EdocsApi.findElementByProperty("code", "OrganizationBankName", account)?.value },
          { code: "ift", value: EdocsApi.findElementByProperty("code", "MFO", account)?.value },
          { code: "currency", value: EdocsApi.findElementByProperty("code", "Currency", account)?.itemCode },
        ]);
      });
    } else {
      accounts.forEach((account) => {
        result.push([
          { code: "number", value: EdocsApi.findElementByProperty("code", "OrganizationAccountNumber", account)?.value },
          { code: "bank", value: EdocsApi.findElementByProperty("code", "OrganizationBankName", account)?.value },
          { code: "ift", value: EdocsApi.findElementByProperty("code", "MFO", account)?.value },
          { code: "id", value: EdocsApi.findElementByProperty("code", "OrganizationAccountNumberID", account)?.value },
          { code: "counterpartyId", value: ctrptId },
          { code: "currency", value: EdocsApi.findElementByProperty("code", "Currency", account)?.itemCode },
        ]);
      });
    }
  }
  return result;
}

function getPersonsTable(persons, method, ctrptId) {
  var result = [];
  if (persons && persons.length > 0) {
    if (method == "edocsCreateDoc") {
      persons.forEach((person) => {
        result.push([
          { code: "fullName", value: EdocsApi.findElementByProperty("code", "counterpartyContactsName", person)?.value },
          { code: "position", value: EdocsApi.findElementByProperty("code", "counterpartyContactsPosition", person)?.value },
          { code: "actingUnderThe", value: EdocsApi.findElementByProperty("code", "ContractorBasisAct", person)?.value },
          /*{"code": "phone", "value": EdocsApi.findElementByProperty('code', 'counterpartyContactsPhone', person)?.value},
            {"code": "email", "value": EdocsApi.findElementByProperty('code', 'counterpartyContactsEmail', person)?.value},
            {"code": "fullNameGenitive", "value": EdocsApi.findElementByProperty('code', 'counterpartyContactsNameGenitive', person)?.value},
            {"code": "positionGenitive", "value": EdocsApi.findElementByProperty('code', 'counterpartyContactsPositionGenitive', person)?.value},*/
        ]);
      });
    } else {
      persons.forEach((person) => {
        result.push([
          { code: "fullName", value: EdocsApi.findElementByProperty("code", "counterpartyContactsName", person)?.value },
          { code: "position", value: EdocsApi.findElementByProperty("code", "counterpartyContactsPosition", person)?.value },
          { code: "actingUnderThe", value: EdocsApi.findElementByProperty("code", "ContractorBasisAct", person)?.value },
          { code: "counterpartyId", value: ctrptId },
          { code: "id", value: EdocsApi.findElementByProperty("code", "counterpartyContactsID", person)?.value },
          /*{"code": "phone", "value": EdocsApi.findElementByProperty('code', 'counterpartyContactsPhone', person)?.value},
            {"code": "email", "value": EdocsApi.findElementByProperty('code', 'counterpartyContactsEmail', person)?.value},
            {"code": "positionGenitive", "value": EdocsApi.findElementByProperty('code', 'counterpartyContactsPositionGenitive', person)?.value},
            {"code": "fullNameGenitive", "value": EdocsApi.findElementByProperty('code', 'counterpartyContactsNameGenitive', person)?.value},*/
        ]);
      });
    }
  }
  return result;
}

function getContactsManager(manager, method, ctrptId) {
  var result = [];
  if (manager && manager.length > 0) {
    if (method == "edocsCreateDoc") {
      manager.forEach((manager) => {
        result.push([
          { code: "name", value: EdocsApi.findElementByProperty("code", "counterpartyManagerName", manager)?.value },
          { code: "position", value: EdocsApi.findElementByProperty("code", "counterpartyManagerPosition", manager)?.value },
          { code: "phone", value: EdocsApi.findElementByProperty("code", "counterpartyManagerPhone", manager)?.value },
          { code: "email", value: EdocsApi.findElementByProperty("code", "counterpartyManagerEmail", manager)?.value },
        ]);
      });
    } else {
      manager.forEach((manager) => {
        result.push([
          { code: "name", value: EdocsApi.findElementByProperty("code", "counterpartyManagerName", manager)?.value },
          { code: "position", value: EdocsApi.findElementByProperty("code", "counterpartyManagerPosition", manager)?.value },
          { code: "phone", value: EdocsApi.findElementByProperty("code", "counterpartyManagerPhone", manager)?.value },
          { code: "email", value: EdocsApi.findElementByProperty("code", "counterpartyManagerEmail", manager)?.value },
          { code: "id", value: EdocsApi.findElementByProperty("code", "counterpartyManagerID", manager)?.value },
          { code: "counterpartyId", value: ctrptId },
        ]);
      });
    }
  }
  return result;
}

function getContactsTable(method, ctrptId) {
  var result = [];
  var Email = EdocsApi.getAttributeValue("counterpartyEmail");
  var Phone = EdocsApi.getAttributeValue("counterpartyPhone");
  if (method == "edocsCreateDoc") {
    if (Email && Email.value) {
      result.push([
        { code: "type", value: "EMAIL" },
        { code: "contact", value: Email.value },
      ]);
    }
    if (Phone && Phone.value) {
      result.push([
        { code: "type", value: "PHONE" },
        { code: "contact", value: Phone.value },
      ]);
    }
  } else {
    if (Email && Email.value) {
      result.push([
        { code: "type", value: "EMAIL" },
        { code: "contact", value: Email.value },
        { code: "id", value: EdocsApi.getAttributeValue("EmailID").value },
        { code: "counterpartyId", value: ctrptId },
      ]);
    }
    if (Phone && Phone.value) {
      result.push([
        { code: "type", value: "PHONE" },
        { code: "contact", value: Phone.value },
        { code: "id", value: EdocsApi.getAttributeValue("PhoneID").value },
        { code: "counterpartyId", value: ctrptId },
      ]);
    }
  }
  return result;
}

function getPostalAddressesTable(addresses, method, ctrptId) {
  debugger;
  var result = [];
  if (addresses && addresses.length > 0) {
    if (method == "edocsCreateDoc") {
      addresses.forEach((address) => {
        result.push([
          { code: "address", value: EdocsApi.findElementByProperty("code", "counterpartyPostalAddress", address)?.value },
          { code: "city", value: EdocsApi.findElementByProperty("code", "counterpartyPostalAddressCity", address)?.value },
        ]);
      });
    } else {
      addresses.forEach((address) => {
        result.push([
          { code: "address", value: EdocsApi.findElementByProperty("code", "counterpartyPostalAddress", address)?.value },
          { code: "city", value: EdocsApi.findElementByProperty("code", "counterpartyPostalAddressCity", address)?.value },
          { code: "id", value: EdocsApi.findElementByProperty("code", "counterpartyPostalAddressID", address)?.value },
          { code: "counterpartyId", value: ctrptId },
        ]);
      });
    }
  }
  return result;
}

function getСontactsManager(manager, method) {
  var result = [];
  if (manager && manager.length > 0) {
    if (method == "edocsCreateDoc") {
      manager.forEach((manager) => {
        result.push([
          { code: "name", value: EdocsApi.findElementByProperty("code", "counterpartyManagerName", manager)?.value },
          { code: "position", value: EdocsApi.findElementByProperty("code", "counterpartyManagerPosition", manager)?.value },
          { code: "phone", value: EdocsApi.findElementByProperty("code", "counterpartyManagerPhone", manager)?.value },
          { code: "email", value: EdocsApi.findElementByProperty("code", "counterpartyManagerEmail", manager)?.value },
        ]);
      });
    } else {
      manager.forEach((manager) => {
        result.push([
          { code: "name", value: EdocsApi.findElementByProperty("code", "counterpartyManagerName", manager)?.value },
          { code: "position", value: EdocsApi.findElementByProperty("code", "counterpartyManagerPosition", manager)?.value },
          { code: "phone", value: EdocsApi.findElementByProperty("code", "counterpartyManagerPhone", manager)?.value },
          { code: "email", value: EdocsApi.findElementByProperty("code", "counterpartyManagerEmail", manager)?.value },
          { code: "id", value: EdocsApi.findElementByProperty("code", "counterpartyManagerID", manager)?.value },
        ]);
      });
    }
  }
  return result;
}

// Зняття обов'язковості поля Код ЄДРПОУ після звповнення чек-боксу Не резидент

/*function onChangeContractorIsResident() {
    var ContractorIsResident = EdocsApi.getAttributeValue("ContractorIsResident");
    if (ContractorIsResident && ContractorIsResident.value) {
      var counterpartyCode = EdocsApi.getControlProperties("counterpartyCode");
      if (counterpartyCode) {
        if (ContractorIsResident.value == "true") {
          counterpartyCode.required = false;
        } else {
          counterpartyCode.required = true;
          isNumbercounterpartyCode();
        }
        EdocsApi.setControlProperties(counterpartyCode);
      }
    }
}*/

function onChangecounterpartyCode() {
  if (EdocsApi.getAttributeValue("ContractorIsResident").value == "false") isNumbercounterpartyCode();

  const counterpartyCode = EdocsApi.getAttributeValue("counterpartyCode");
  if (counterpartyCode.value?.length > 12) throw "Не може містити більше 12 символів. Будь ласка, перевірте введені дані";
}

function isNumbercounterpartyCode() {
  var counterpartyCode = EdocsApi.getAttributeValue("counterpartyCode").value;
  if (counterpartyCode) if (!/^\d+$/.test(counterpartyCode)) throw "Для резидентів України в полі Код ЄДРПОУ може бути тільки число";
}

function onChangeDocKind(doNotClearOnInit) {
  debugger;
  var DocKind = EdocsApi.getAttributeValue("DocKind");

  if (DocKind.text == "Заявка на внесення змін") {
    EdocsApi.setControlProperties({ code: "Contractor", hidden: false, required: true });
    EdocsApi.setControlProperties({ code: "counterpartyCode", disabled: true });
    EdocsApi.setControlProperties({ code: "getEDRDataButton", hidden: true });
    EdocsApi.setControlProperties({ code: "counterpartyType", hidden: true });
    EdocsApi.setControlProperties({ code: "additionalInfo", disabled: true });
    EdocsApi.setControlProperties({ code: "ContractorIsResident", disabled: true });
    showOrHideChangesCheckboxes(false);
    EdocsApi.setControlProperties({ code: "counterpartyFullName", required: false });
    disableEnableContractorFields(true);
    setPropertyHidden("shortDescription", true);
    setPropertyDisabled("stateProp", true);
    //        showChangeIdDocuments(EdocsApi.getAttributeValue('counterpartyOwnershipType').value)
    if (!doNotClearOnInit) {
      EdocsApi.setAttributeValue({ code: "counterpartyType", value: "Постачальник" });
    }
  }
  if (DocKind.text == "Заявка на додавання") {
    EdocsApi.setControlProperties({ code: "Contractor", hidden: true, required: false });
    EdocsApi.setControlProperties({ code: "counterpartyCode", disabled: false, required: true });
    EdocsApi.setControlProperties({ code: "ContractorIsResident", disabled: false });
    EdocsApi.setControlProperties({ code: "counterpartyType", hidden: false });
    EdocsApi.setControlProperties({ code: "additionalInfo", disabled: false });
    setPropertyHidden("getEDRDataButton", false);
    showOrHideChangesCheckboxes(true);
    EdocsApi.setControlProperties({ code: "counterpartyFullName", required: true });
    disableEnableContractorFields(false);
    setPropertyHidden("shortDescription", false);
    if (!doNotClearOnInit) {
      var doNotClearOnInit = doNotClearOnInit || true;
      clearAttribute("counterpartyType", doNotClearOnInit);
    }
  }
  if (!DocKind.text) {
    clearContractorData(doNotClearOnInit);
    clearAttribute("Contractor", doNotClearOnInit);
    clearAttribute("ContractorID", doNotClearOnInit);
  }
}

function clearContractorData(doNotClearOnInit) {
  debugger;
  clearAttribute("counterpartyCode", doNotClearOnInit);
  clearAttribute("counterpartyName", doNotClearOnInit);
  clearAttribute("foreignShortName", doNotClearOnInit);
  clearAttribute("counterpartyFullName", doNotClearOnInit);
  clearAttribute("foreignFullName", doNotClearOnInit);
  clearAttribute("counterpartyLegalAddress", doNotClearOnInit);
  clearAttribute("TableСounterpartyPostalAddress", doNotClearOnInit);
  clearAttribute("TableOrganizationAccountNumber", doNotClearOnInit);
  clearAttribute("counterpartyOwnershipType", doNotClearOnInit);
  clearAttribute("counterpartyTaxStatus", doNotClearOnInit);
  clearAttribute("counterpartyVatNumber", doNotClearOnInit);
  clearAttribute("counterpartyTaxStatusAddInfo", doNotClearOnInit);
  clearAttribute("PayerVAT", doNotClearOnInit);
  clearAttribute("counterpartyIdDocuments", doNotClearOnInit);
  clearAttribute("CertificateNumber", doNotClearOnInit);
  clearAttribute("counterpartyEmail", doNotClearOnInit);
  clearAttribute("counterpartyPhone", doNotClearOnInit);
  clearAttribute("counterpartyContactsTable", doNotClearOnInit);
  clearAttribute("counterpartyManagerTable", doNotClearOnInit);
  clearAttribute("additionalInfo", doNotClearOnInit);

  clearAttribute("guid", doNotClearOnInit);
}

function disableEnableContractorFields(isDisabled) {
  setPropertyDisabled("counterpartyCode", isDisabled);
  setPropertyDisabled("counterpartyName", isDisabled);
  setPropertyDisabled("foreignShortName", isDisabled);
  setPropertyDisabled("counterpartyFullName", isDisabled);
  setPropertyDisabled("foreignFullName", isDisabled);
  setPropertyDisabled("counterpartyLegalAddress", isDisabled);
  setPropertyDisabled("TableСounterpartyPostalAddress", isDisabled);
  setPropertyDisabled("TableOrganizationAccountNumber", isDisabled);
  setPropertyDisabled("counterpartyOwnershipType", isDisabled);
  setPropertyDisabled("counterpartyTaxStatus", isDisabled);
  setPropertyDisabled("counterpartyVatNumber", isDisabled);
  setPropertyDisabled("counterpartyTaxStatusAddInfo", isDisabled);
  setPropertyDisabled("PayerVAT", isDisabled);
  setPropertyDisabled("counterpartyIdDocuments", isDisabled);
  setPropertyDisabled("CertificateNumber", isDisabled);
  setPropertyDisabled("counterpartyEmail", isDisabled);
  setPropertyDisabled("counterpartyPhone", isDisabled);
  setPropertyDisabled("counterpartyContactsTable", isDisabled);
  setPropertyDisabled("counterpartyManagerTable", isDisabled);
  // колонки таблиць
  setPropertyDisabled("OrganizationAccountNumber", isDisabled);
  setPropertyDisabled("OrganizationBankName", isDisabled);
  setPropertyDisabled("MFO", isDisabled);
  setPropertyDisabled("counterpartyPostalAddress", isDisabled);
  setPropertyDisabled("counterpartyPostalAddressCity", isDisabled);
  setPropertyDisabled("counterpartyContactsName", isDisabled);
  setPropertyDisabled("counterpartyContactsPosition", isDisabled);
  setPropertyDisabled("ContractorBasisAct", isDisabled);
  setPropertyDisabled("counterpartyManagerPosition", isDisabled);
  setPropertyDisabled("counterpartyManagerName", isDisabled);
  setPropertyDisabled("counterpartyManagerPhone", isDisabled);
  setPropertyDisabled("counterpartyManagerEmail", isDisabled);
}

function onChangeContractorID() {
  debugger;
  var ContractorID = EdocsApi.getAttributeValue("ContractorID");

  var type;

  if (ContractorID.value) {
    var counterpartyType = EdocsApi.getAttributeValue("counterpartyType");
    if (counterpartyType.value) {
      if (counterpartyType.value == "Покупець") {
        type = "2";
      } else {
        type = "1";
      }
    } else {
      throw "Не зазначено тип контрагента";
    }

    var ContractorData = EdocsApi.runExternalFunction("Contractors", "edocsGETCONTRACTOR?format=json&CONTRACTORID=" + ContractorID.value + "&CONTRACTORTYPE=" + type + "&MAXRESULTCOUNT=200", null, "get");

    EdocsApi.setAttributeValue({ code: "counterpartyCode", value: ContractorData.data.Code });
    EdocsApi.setAttributeValue({ code: "counterpartyName", value: ContractorData.data.ShortName });
    EdocsApi.setAttributeValue({ code: "foreignShortName", value: ContractorData.data.ForeignShortName });
    EdocsApi.setAttributeValue({ code: "counterpartyFullName", value: ContractorData.data.FullName });
    EdocsApi.setAttributeValue({ code: "foreignFullName", value: ContractorData.data.ForeignFullName });
    EdocsApi.setAttributeValue({ code: "counterpartyTaxStatus", value: ContractorData.data.TaxPayerStatus });
    EdocsApi.setAttributeValue({ code: "counterpartyVatNumber", value: ContractorData.data.TaxId });
    EdocsApi.setAttributeValue({ code: "ContractorIsResident", value: (ContractorData.data.NonResident && ContractorData.data.NonResident == true) || ContractorData.data.NonResident == "true" ? true : false });
    //EdocsApi.setAttributeValue({code: 'counterpartyTaxStatusAddInfo', value: ContractorData.data.counterpartyTaxStatusAddInfo});
    EdocsApi.setAttributeValue({ code: "counterpartyOwnershipType", value: setTypeOfOwnership(ContractorData.data.TypeOfOwnership) });
    EdocsApi.setAttributeValue({ code: "CertificateNumber", value: ContractorData.data.VatNumber });
    EdocsApi.setAttributeValue({ code: "counterpartyIdDocuments", value: ContractorData.data.IdDocument });
    EdocsApi.setAttributeValue({ code: "counterpartyLegalAddress", value: ContractorData.data.LegalAddress });
    EdocsApi.setAttributeValue({ code: "guid", value: ContractorData.data.ContractorId });
    EdocsApi.setAttributeValue({ code: "additionalInfo", value: ContractorData.data.Information });
    EdocsApi.setAttributeValue({ code: "stateProp", value: ContractorData.data.stateProp });
    /*if (EdocsApi.findElementByProperty('type', 'Phone', ContractorData.data.contractorContacts).contact) {
              EdocsApi.setAttributeValue({code: 'counterpartyPhone', value: EdocsApi.findElementByProperty('type', 'Phone', ContractorData.data.contacts).contact});
          }
          if (EdocsApi.findElementByProperty('type', 'Email', ContractorData.data.contractorContacts).contact) {
              EdocsApi.setAttributeValue({code: 'counterpartyEmail', value: EdocsApi.findElementByProperty('type', 'Email', ContractorData.data.contacts).contact});
          }*/
    // if (ContractorData.data.PayerVAT) {
    if (ContractorData.data.PayerVAT == true) {
      EdocsApi.setAttributeValue({ code: "PayerVAT", value: "Так" });
    } else {
      EdocsApi.setAttributeValue({ code: "PayerVAT", value: "Ні" });
    }
    /*} else {
              clearAttribute ('PayerVAT');
          }*/
    if (ContractorData.data.contacts && ContractorData.data.contacts.length > 0) {
      EdocsApi.setAttributeValue({ code: "counterpartyPhone", value: ContractorData.data.contacts.find((x) => x.Type == "Phone")?.Contact });
      EdocsApi.setAttributeValue({ code: "counterpartyEmail", value: ContractorData.data.contacts.find((x) => x.Type == "Email")?.Contact });

      EdocsApi.setAttributeValue({ code: "PhoneID", value: ContractorData.data.contacts.find((x) => x.Type == "Phone")?.Id });
      EdocsApi.setAttributeValue({ code: "EmailID", value: ContractorData.data.contacts.find((x) => x.Type == "Email")?.Id });
    }

    if (ContractorData.data.postalAddresses && ContractorData.data.postalAddresses.length > 0) {
      var TablePostalAddress = EdocsApi.getAttributeValue("TableСounterpartyPostalAddress");
      TablePostalAddress.value = [];

      for (var i = 0; i < ContractorData.data.postalAddresses.length; i++) {
        var row = ContractorData.data.postalAddresses[i];
        var dataRow = [];
        dataRow.push({ code: "counterpartyPostalAddress", value: row.PostalAddress });
        dataRow.push({ code: "counterpartyPostalAddressCity", value: row.PostalAddressCity });

        dataRow.push({ code: "counterpartyPostalAddressID", value: row.Id });

        TablePostalAddress.value.push(dataRow);
      }
      EdocsApi.setAttributeValue(TablePostalAddress);
    }
    if (ContractorData.data.authorisedPersons && ContractorData.data.authorisedPersons.length > 0) {
      var signersTable = EdocsApi.getAttributeValue("counterpartyContactsTable");
      signersTable.value = [];

      for (var i = 0; i < ContractorData.data.authorisedPersons.length; i++) {
        var row = ContractorData.data.authorisedPersons[i];
        var dataRow = [];
        dataRow.push({ code: "counterpartyContactsName", value: row.FullName });
        /*dataRow.push({code:'counterpartyContactsNameGenitive', value:row.NameGenitive }); */
        dataRow.push({ code: "counterpartyContactsPosition", value: row.Position });
        /*dataRow.push({code:'counterpartyContactsPositionGenitive', value:row.PositionGenitive });*/
        dataRow.push({ code: "ContractorBasisAct", value: row.ActingUnderThe });
        dataRow.push({ code: "counterpartyContactsID", value: row.Id });

        signersTable.value.push(dataRow);
      }
      EdocsApi.setAttributeValue(signersTable);
    }
    if (ContractorData.data.accounts && ContractorData.data.accounts.length > 0) {
      var accountsTable = EdocsApi.getAttributeValue("TableOrganizationAccountNumber");
      accountsTable.value = [];

      for (var i = 0; i < ContractorData.data.accounts.length; i++) {
        var row = ContractorData.data.accounts[i];
        var curr = EdocsApi.getDictionaryData("Currency", row.Currency)[0];
        var dataRow = [];
        dataRow.push({ code: "OrganizationAccountNumber", value: row.Number });
        dataRow.push({ code: "OrganizationBankName", value: row.Bank });
        dataRow.push({ code: "MFO", value: row.Mfo });
        dataRow.push({ code: "Currency", value: curr.id, text: curr.value, itemCode: curr.code });
        dataRow.push({ code: "OrganizationAccountNumberID", value: row.Id });

        accountsTable.value.push(dataRow);
      }
      EdocsApi.setAttributeValue(accountsTable);
    }
    if (ContractorData.data.managers && ContractorData.data.managers.length > 0) {
      var managersTable = EdocsApi.getAttributeValue("counterpartyManagerTable");
      managersTable.value = [];

      for (var i = 0; i < ContractorData.data.managers.length; i++) {
        var row = ContractorData.data.managers[i];
        var dataRow = [];
        dataRow.push({ code: "counterpartyManagerName", value: row.Name });
        dataRow.push({ code: "counterpartyManagerPosition", value: row.Position });
        dataRow.push({ code: "counterpartyManagerEmail", value: row.Email });
        dataRow.push({ code: "counterpartyManagerPhone", value: row.Phone });

        dataRow.push({ code: "counterpartyManagerID", value: row.Id });

        managersTable.value.push(dataRow);
      }
      EdocsApi.setAttributeValue(managersTable);
    }
    onChangecounterpartyOwnershipType();
    showChangeIdDocuments(ContractorData.data.TypeOfOwnership);

    //onChangecounterpartyTaxStatus();
    //onChangeContractorIsResident();
  } else {
    clearContractorData();
  }
}

function onSearchContractor(request) {
  //debugger;
  var counterpartyType = EdocsApi.getAttributeValue("counterpartyType");
  if (counterpartyType.value == "Покупець") {
    request.filterCollection.push({ attributeCode: "ContractorType", value: "Debitor" });
  } else {
    request.filterCollection.push({ attributeCode: "ContractorType", value: "Creditor" });
  }
}

function showChangeIdDocuments(typeOfOwnership) {
  if (typeOfOwnership && (typeOfOwnership == "ENTREPRENEUR" || typeOfOwnership == "PERSON" || typeOfOwnership == "Фізична особа-підприємець" || typeOfOwnership == "Приватна особа")) {
    setPropertyHidden("ChangeIdDocuments", false);
    setPropertyDisabled("counterpartyIdDocuments", true);
  } else {
    setPropertyHidden("ChangeIdDocuments", true);
  }
}

/*function onAddCtrpChangesKind() {
      debugger;
      var CtrpChangesKind = EdocsApi.getAttributeValue('CtrpChangesKind');
  
      if (CtrpChangesKind.value) {
          var result = JSON.parse(CtrpChangesKind.value)
          for (var i=0; i<result.length; i++){
              unLockFields(result[i].value);
          }
      }
  }
  
  function onDeleteCtrpChangesKind() {
      debugger;
      disableEnableContractorFields(true);
      var CtrpChangesKind = EdocsApi.getAttributeValue('CtrpChangesKind');
  
      if (CtrpChangesKind.value) {
          var result = JSON.parse(CtrpChangesKind.value)
          for (var i=0; i<result.length; i++){
              unLockFields(result[i].value);
          }
      }
  }
  
  function unLockFields(ChangesKind) {
      debugger;
      switch (ChangesKind) {
          case 'Форма власності': return setPropertyDisabled('counterpartyOwnershipType', false);
          case 'Юридична адреса': return setPropertyDisabled('counterpartyLegalAddress', false);
          case 'Поштова адреса': return setPropertyDisabled('TableСounterpartyPostalAddress', false);
          case 'Рахунки': return setPropertyDisabled('TableOrganizationAccountNumber', false);
          case 'Статус платника': return setPropertyDisabled('counterpartyTaxStatus', false);
          case 'ІПН': return setPropertyDisabled('counterpartyVatNumber', false);
          case 'група, ставка': return setPropertyDisabled('counterpartyTaxStatusAddInfo', false);
          case 'Є платником ПДВ': return setPropertyDisabled('PayerVAT', false);
          case '№ свідоцтва платника ПДВ (про видачу ІПН)': return setPropertyDisabled('CertificateNumber', false);
          case 'E-mail Контрагента': return setPropertyDisabled('counterpartyEmail', false);
          case 'Телефон Контрагента': return setPropertyDisabled('counterpartyPhone', false);
          case 'Менеджери контрагентів': return setPropertyDisabled('counterpartyManagerTable', false);
  
          default: return ;
      }
  }*/

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

function showOrHideChangesCheckboxes(boolValue) {
  setPropertyHidden("ChangeCertificateNumber", boolValue);
  setPropertyHidden("ChangeTaxStatus", boolValue);
  setPropertyHidden("ChangeAccountNumber", boolValue);
  setPropertyHidden("ChangeEmail", boolValue);
  setPropertyHidden("ChangeLegalAddress", boolValue);
  setPropertyHidden("ChangePostalAddress", boolValue);
  setPropertyHidden("ChangeContacts", boolValue);
  setPropertyHidden("ChangeManager", boolValue);
  setPropertyHidden("ChangeIdDocuments", boolValue);
  setPropertyHidden("ChangeName", boolValue);
  setPropertyHidden("ChangeadditionalInfo", boolValue);
  setPropertyHidden("ChangeVat", boolValue);
}

function onChangeChangeCertificateNumber() {
  var ChangeCertificateNumber = EdocsApi.getAttributeValue("ChangeCertificateNumber");

  if (ChangeCertificateNumber.value == "true") {
    setPropertyDisabled("ChangeCertificateNumber", true);
    setPropertyDisabled("CertificateNumber", false);
    setPropertyDisabled("PayerVAT", false);
  } else {
    setPropertyDisabled("CertificateNumber", true);
    setPropertyDisabled("PayerVAT", true);
  }
}

function onChangeChangeadditionalInfo() {
  var AdditionalInfo = EdocsApi.getAttributeValue("ChangeadditionalInfo");

  if (AdditionalInfo.value == "true") {
    setPropertyDisabled("ChangeadditionalInfo", true);
    setPropertyDisabled("additionalInfo", false);
  } else {
    setPropertyDisabled("additionalInfo", true);
  }
}

function onChangeChangeTaxStatus() {
  var ChangeTaxStatus = EdocsApi.getAttributeValue("ChangeTaxStatus");

  if (ChangeTaxStatus.value == "true") {
    setPropertyDisabled("ChangeTaxStatus", true);
    setPropertyDisabled("counterpartyTaxStatus", false);
  } else {
    setPropertyDisabled("counterpartyTaxStatus", true);
  }
}

function onChangeChangeAccountNumber() {
  var ChangeAccountNumber = EdocsApi.getAttributeValue("ChangeAccountNumber");

  if (ChangeAccountNumber.value == "true") {
    setPropertyDisabled("ChangeAccountNumber", true);
    setPropertyDisabled("TableOrganizationAccountNumber", false);
    setPropertyDisabled("OrganizationAccountNumber", false);
    setPropertyDisabled("OrganizationBankName", false);
    setPropertyDisabled("MFO", false);
    setPropertyDisabled("Currency", false);
  } else {
    setPropertyDisabled("TableOrganizationAccountNumber", true);
    setPropertyDisabled("OrganizationAccountNumber", true);
    setPropertyDisabled("OrganizationBankName", true);
    setPropertyDisabled("MFO", true);
    setPropertyDisabled("Currency", true);
  }
}

function onChangeChangeName() {
  var ChangeNam = EdocsApi.getAttributeValue("ChangeName");

  if (ChangeNam.value == "true") {
    setPropertyDisabled("ChangeName", true);
    setPropertyDisabled("counterpartyName", false);
    setPropertyDisabled("counterpartyFullName", false);
    setPropertyDisabled("foreignShortName", false);
    setPropertyDisabled("foreignFullName", false);
  } else {
    setPropertyDisabled("counterpartyName", true);
    setPropertyDisabled("counterpartyFullName", true);
    setPropertyDisabled("foreignShortName", true);
    setPropertyDisabled("foreignFullName", true);
  }
}

function onChangeChangeVat() {
  var ChangeV = EdocsApi.getAttributeValue("ChangeVat");

  if (ChangeV.value == "true") {
    setPropertyDisabled("ChangeVat", true);
    setPropertyDisabled("counterpartyVatNumber", false);
  } else {
    setPropertyDisabled("counterpartyVatNumber", true);
  }
}

function onChangeChangeEmail() {
  var ChangeEmail = EdocsApi.getAttributeValue("ChangeEmail");

  if (ChangeEmail.value == "true") {
    setPropertyDisabled("ChangeEmail", true);
    setPropertyDisabled("counterpartyEmail", false);
    setPropertyDisabled("counterpartyPhone", false);
  } else {
    setPropertyDisabled("counterpartyEmail", true);
    setPropertyDisabled("counterpartyPhone", true);
  }
}

function onChangeChangeLegalAddress() {
  var ChangeLegalAddress = EdocsApi.getAttributeValue("ChangeLegalAddress");

  if (ChangeLegalAddress.value == "true") {
    setPropertyDisabled("ChangeLegalAddress", true);
    setPropertyDisabled("counterpartyLegalAddress", false);
  } else {
    setPropertyDisabled("counterpartyLegalAddress", true);
  }
}

function onChangeChangePostalAddress() {
  var ChangePostalAddress = EdocsApi.getAttributeValue("ChangePostalAddress");

  if (ChangePostalAddress.value == "true") {
    setPropertyDisabled("ChangePostalAddress", true);
    setPropertyDisabled("TableСounterpartyPostalAddress", false);
    setPropertyDisabled("counterpartyPostalAddress", false);
    setPropertyDisabled("counterpartyPostalAddressCity", false);
  } else {
    setPropertyDisabled("TableСounterpartyPostalAddress", true);
    setPropertyDisabled("counterpartyPostalAddress", true);
    setPropertyDisabled("counterpartyPostalAddressCity", true);
  }
}

function onChangeChangeContacts() {
  var ChangeContacts = EdocsApi.getAttributeValue("ChangeContacts");

  if (ChangeContacts.value == "true") {
    setPropertyDisabled("ChangeContacts", true);
    setPropertyDisabled("counterpartyContactsTable", false);
    setPropertyDisabled("counterpartyContactsName", false);
    setPropertyDisabled("counterpartyContactsPosition", false);
    setPropertyDisabled("ContractorBasisAct", false);
  } else {
    setPropertyDisabled("counterpartyContactsTable", true);
    setPropertyDisabled("counterpartyContactsName", true);
    setPropertyDisabled("counterpartyContactsPosition", true);
    setPropertyDisabled("ContractorBasisAct", true);
  }
}

function onChangeChangeManager() {
  var ChangeManager = EdocsApi.getAttributeValue("ChangeManager");

  if (ChangeManager.value == "true") {
    setPropertyDisabled("ChangeManager", true);
    setPropertyDisabled("counterpartyManagerTable", false);
    setPropertyDisabled("counterpartyManagerPosition", false);
    setPropertyDisabled("counterpartyManagerName", false);
    setPropertyDisabled("counterpartyManagerPhone", false);
    setPropertyDisabled("counterpartyManagerEmail", false);
  } else {
    setPropertyDisabled("counterpartyManagerTable", true);
    setPropertyDisabled("counterpartyManagerPosition", true);
    setPropertyDisabled("counterpartyManagerName", true);
    setPropertyDisabled("counterpartyManagerPhone", true);
    setPropertyDisabled("counterpartyManagerEmail", true);
  }
}

function onChangeChangeIdDocuments() {
  debugger;
  var ChangeIdDocuments = EdocsApi.getAttributeValue("ChangeIdDocuments");

  if (ChangeIdDocuments.value == "true") {
    setPropertyDisabled("ChangeIdDocuments", true);
    setPropertyDisabled("counterpartyIdDocuments", false);
  } else {
    setPropertyDisabled("counterpartyIdDocuments", true);
  }
}

//Замінити коди підрозділів на ПРОДі
function onChangeadditionalInfo() {
  debugger;
  if (EdocsApi.getEmployeeDataByEmployeeID(CurrentUser.employeeId).unitId != 177 && EdocsApi.getEmployeeDataByEmployeeID(CurrentUser.employeeId).unitId != 181) {
    throw "Немає прав на редагування поля Додаткова інформація";
  }
}

function onTaskExecuteForReview(routeStage) {
  debugger;
  if (routeStage.executionResult == "executed") {
    var nonResident = EdocsApi.getAttributeValue("ContractorIsResident");
    if (nonResident.value == "true") {
      var additionalInfo = EdocsApi.getAttributeValue("additionalInfo");
      if (!additionalInfo.value) throw "Заповніть поле «Додаткова інформація»";
    }
    setPropertyDisabled("additionalInfo", true);
  }
}

function onChangePayerVAT() {
  if (EdocsApi.getAttributeValue("PayerVAT").value == "Так") {
    setPropertyRequired("CertificateNumber", true);
  } else {
    setPropertyRequired("CertificateNumber", false);
  }
}
