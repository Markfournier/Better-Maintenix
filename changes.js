//Create the popups and set the fault name and description to whatever is selected
function selectStoredFault() {
    var definitiondrop = document.getElementById("definitiondrop");
    var selected = definitiondrop.value;
    var popuparray = [];
    var characterposition = [];
    var storedcharposition = [];
    //    console.log(selected);
    for (i = 0; i < selected.length; i++) {
        //        console.log(selected.charAt(i));
        if (selected.charAt(i) == "$") {
            characterposition.push(i);

        }
        //        console.log(characterposition.length);
        if (characterposition.length == 2) {

            popuparray.push(selected.substring(characterposition[0] + 1, characterposition[1]));
            storedcharposition.push(characterposition);
            characterposition = [];
        }
    }
    for (i = 0; i < storedcharposition.length; i++) {
        var defectlocation = prompt("Input " + popuparray[i]);
        selected = selected.replace("$" + popuparray[i] + "$", defectlocation);

        //        document.getElementById("idCellFaultName").value = document.getElementById("bm_areaselect").value + " " + document.getElementById("bm_tradeselect").value + " "+ document.getElementById("bm_catselect").value + " " + selected;
        document.getElementById("idCellFaultName").value = document.getElementById("idCellFaultName").value + " " + selected;
        //nex section gets the scheduled hours based up the definition ID
    }
    var xhr = new XMLHttpRequest();
    var uniqueID = definitiondrop[definitiondrop.selectedIndex].getAttribute("uniquevalue");
    //        console.log(uniqueID);
    xhr.open("GET", "https://av-it-services.com/faultstore/schedhours.php?faultdefid=" + uniqueID, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var resp = JSON.parse(xhr.responseText);
            //                console.log(resp[0]);
            document.getElementById("idInput34").value = resp;
        }
    }
    xhr.send();

    document.getElementById("idCellFaultDescription").value = selected;
}

//Puts the fault descriptions in the drop down.  Sets the value of the option to the unique ID of the fault definition
function deployStoredFaults(faultlist) {
    document.getElementById("definitionarea").innerHTML = '';
    var definitiondrop = document.createElement("select");
    definitiondrop.style.width = '603px';
    if (faultlist.length == 0) {
        definitiondrop.style.display = "none";
    }
    definitiondrop.id = "definitiondrop";
    document.getElementById("definitionarea").appendChild(definitiondrop);
    var blankoption = document.createElement("option");
    definitiondrop.appendChild(blankoption)
    for (i = 0; i < faultlist.length; i++) {
        var newoption = document.createElement("option");
        newoption.id = i;
        newoption.innerHTML = faultlist[i][0];
        newoption.setAttribute("uniquevalue", faultlist[i][2])
        definitiondrop.appendChild(newoption);
    }
    document.getElementById("definitiondrop").addEventListener("change", function () {
        selectStoredFault()
    });
}

function getStoredFaults(area, trade, assembly) {
    document.getElementById("bm_zoneselect").style.display = "none";
    document.getElementById("bm_subzoneselect").style.display = "none";
    document.getElementById("bm_subsubzoneselect").style.display = "none";
    var xhr = new XMLHttpRequest();
    var boof = [];
    xhr.open("GET", "https://av-it-services.com/faultstore/fault.php?area=" + area + "&trade=" + trade + "&assy=&zone=&subzone=&subsubzone=", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {

            var resp = JSON.parse(xhr.responseText);
            //            console.log(resp[0]);
            deployStoredFaults(resp);
        }
    }
    xhr.send();
    document.getElementById("bm_subzoneselect").length = 0;
    document.getElementById("bm_subsubzoneselect").length = 0;
    getZones(area, assembly);

}

//What were trying to do here is grab the technical references from the Task info tab and display it on the Execution Tab
function getTechRefs() {
    tablink = document.getElementById("idTabbedSection12").getAttribute("href");
    fullurl = document.location.origin + tablink;
    //    console.log(fullurl);
    var xhr = new XMLHttpRequest();
    xhr.open("GET", fullurl, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            parser = new DOMParser();
            response = parser.parseFromString(xhr.response, "text/html");
            techrefform = response.getElementById("idForm36").getElementsByTagName("table")[3];
            techrefrows = techrefform.getElementsByTagName("tr");
            if (techrefrows.length > 1) {
                techrefarray = {};
                for (rows = 1; rows < techrefrows.length; rows++) {
                    key = techrefrows[rows].getElementsByTagName("td")[1].firstChild.innerHTML;
                    val = techrefrows[rows].getElementsByTagName("td")[2].firstChild.getAttribute("href");
                    techrefarray[key] = val;
                }
                appendTechRefs(techrefarray);
            }


        }
    }
    xhr.send();
}
//Adds all the tech references to the headerbox on the task details page
function appendTechRefs(refarray) {
    headerbox = document.getElementById("idGBox1");
    technicalrefsheader = document.createElement("tr");
    technicalrefsheader.id = "idHeaderRow_idTechReferences";
    technicalrefsheader.className = "formHeaderRow";
    technicalrefsheaderdata = document.createElement("td");
    headerbox.firstChild.appendChild(technicalrefsheader);
    technicalrefsheader.appendChild(technicalrefsheaderdata);
    technicalrefsheaderdata.innerHTML = "Technical References";
    technicalrefscontent = document.createElement("tr");
    technicalrefscontent.id = "idContentRow_idTechReferences";
    technicalrefscontent.className = "formContentRow";
    technicalrefscontentdata = document.createElement("td");
    headerbox.firstChild.appendChild(technicalrefscontent);
    technicalrefscontent.appendChild(technicalrefscontentdata);
    for (key in refarray) {
        newlink = document.createElement("a");
        newlink.setAttribute("href", refarray[key]);
        technicalrefscontentdata.appendChild(newlink);
        newlink.setAttribute("target", "_blank");
        newlink.innerHTML = key;
        linebreak = document.createElement("br");
        technicalrefscontentdata.appendChild(linebreak);
    }
}

//This function scans the task title for the the string "PANELS " before the Delineating Character. It then inserts P/N before the Delineating Character.  It will run every time a new zone/sub-zone/sub-sub-zone is selected
function insertPN() {
    faulttitle = document.getElementById("idCellFaultName").value;
    delinchar = faulttitle.indexOf("-");
    //    console.log(faulttitle.substr(delinchar-7,6));
    if (faulttitle.substr(delinchar - 7, 6) == "PANELS" && document.getElementById("bm_tradeselect").value == "FGBS") {
        newfault = faulttitle.substring(0, delinchar - 1) + " PN: - "
            //        console.log(newfault);
        document.getElementById("idCellFaultName").value = newfault;
    }

}

//this functions job is to add any defined faults.  Due to the direction that the business wanted to take this extension it became unused but was never removed.  It has since been found that as it sends the ASSY in the GET request to the server it is quite a good way to collect statistics around how the extension is being used.  See HTTPS://av-it-services.com/faultstore/tracking.php
function getDefinedFaults() {
    assy = aircraftType();
    //    console.log("!");
    area = document.getElementById("bm_areaselect").value;
    zone = document.getElementById("bm_zoneselect").value;
    subzone = document.getElementById("bm_subzoneselect").value;
    subsubzone = document.getElementById("bm_subsubzoneselect").value;
    trade = document.getElementById("bm_tradeselect").value;
    var xmlreq = new XMLHttpRequest();
    xmlreq.open("GET", "https://av-it-services.com/faultstore/fault.php?assy=" + assy + "&area=" + area + "&zone=" + zone + "&subzone=" + subzone + "&subsubzone=" + subsubzone + "&trade=" + trade, true);
    xmlreq.onreadystatechange = function () {
        if (xmlreq.readyState == 4) {
            var resp = JSON.parse(xmlreq.responseText);
            //            deployStoredFaults(resp);
            console.log(resp);
        }
    }
    xmlreq.send();
}

//Gets Zones based on area and Aircraft type
function getZones(area, assembly) {
    var newxhr = new XMLHttpRequest();
    newxhr.open("GET", "https://av-it-services.com/faultstore/zone.php?area=" + area + "&assembly=" + assembly, true);
    newxhr.onreadystatechange = function () {
        if (newxhr.readyState == 4) {
            var resp1 = JSON.parse(newxhr.responseText);
            //            console.log(resp1);
            if (resp1.length > 0) {
                bm_zoneselect.style.display = '';
            }
            bm_zoneselect.length = 0;
            var blankoption = document.createElement("option");
            bm_zoneselect.appendChild(blankoption);
            blankoption.setAttribute("value", 0);
            for (i = 0; i < resp1.length; i++) {
                var newoption = document.createElement("option");
                newoption.id = i;
                newoption.innerHTML = resp1[i][0];
                newoption.setAttribute("value", resp1[i][1])
                bm_zoneselect.appendChild(newoption);
            }
        }
    }
    newxhr.send()
}

//This gets the subzones based on the selected zone
function getSubZones() {
    document.getElementById("bm_subzoneselect").length = 0;
    document.getElementById("bm_subsubzoneselect").length = 0;
    var xhr = new XMLHttpRequest();
    var titlebox = document.getElementById("idCellFaultName");
    var areaselect = document.getElementById("bm_areaselect");
    var tradeselect = document.getElementById("bm_tradeselect");
    var catselect = document.getElementById("bm_catselect");
    var zoneselect = document.getElementById("bm_zoneselect");
    titlebox.value = areaselect.value + " " + tradeselect.value + " " + catselect.value + " " + zoneselect.options[zoneselect.selectedIndex].text + " - ";
    zoneid = document.getElementById("bm_zoneselect").value;
    xhr.open("GET", "https://av-it-services.com/faultstore/subzone.php?zone=" + zoneid, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {

            var resp = JSON.parse(xhr.responseText);
            //            console.log(resp);
            bm_subzoneselect.length = 0;
            var blankoption = document.createElement("option");
            bm_subzoneselect.appendChild(blankoption);
            blankoption.setAttribute("value", 0);
            if (resp.length > 0) {
                bm_subzoneselect.style.display = '';
            }
            for (i = 0; i < resp.length; i++) {
                var newoption = document.createElement("option");
                newoption.id = i;
                newoption.innerHTML = resp[i][0];
                newoption.setAttribute("value", resp[i][1])
                bm_subzoneselect.appendChild(newoption);
            }
        }
    }
    xhr.send();
}

function getSubSubZones() {
    var titlebox = document.getElementById("idCellFaultName");
    var areaselect = document.getElementById("bm_areaselect");
    var tradeselect = document.getElementById("bm_tradeselect");
    var catselect = document.getElementById("bm_catselect");
    var zoneselect = document.getElementById("bm_zoneselect");
    var subzoneselect = document.getElementById("bm_subzoneselect");
    titlebox.value = areaselect.value + " " + tradeselect.value + " " + catselect.value + " " + zoneselect.options[zoneselect.selectedIndex].text + " " + subzoneselect.options[subzoneselect.selectedIndex].text + " - ";
    var xhr = new XMLHttpRequest();
    subzoneid = document.getElementById("bm_subzoneselect").value;
    xhr.open("GET", "https://av-it-services.com/faultstore/subsubzone.php?subzone=" + subzoneid, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {

            var resp = JSON.parse(xhr.responseText);
            //            console.log(resp[0]);
            bm_subsubzoneselect.length = 0;
            var blankoption = document.createElement("option");
            bm_subsubzoneselect.appendChild(blankoption);
            blankoption.setAttribute("value", 0);
            if (resp.length > 0) {
                bm_subsubzoneselect.style.display = '';
            }
            for (i = 0; i < resp.length; i++) {
                var newoption = document.createElement("option");
                newoption.id = i;
                newoption.innerHTML = resp[i][0];
                newoption.setAttribute("value", resp[i][1])
                bm_subsubzoneselect.appendChild(newoption);
            }
        }
    }
    xhr.send();
    insertPN();
}

function addSubSubZone() {
    var titlebox = document.getElementById("idCellFaultName");
    var areaselect = document.getElementById("bm_areaselect");
    var tradeselect = document.getElementById("bm_tradeselect");
    var catselect = document.getElementById("bm_catselect");
    var zoneselect = document.getElementById("bm_zoneselect");
    var subzoneselect = document.getElementById("bm_subzoneselect");
    var subsubzoneselect = document.getElementById("bm_subsubzoneselect");
    titlebox.value = areaselect.value + " " + tradeselect.value + " " + catselect.value + " " + zoneselect.options[zoneselect.selectedIndex].text + " " + subzoneselect.options[subzoneselect.selectedIndex].text + " " + subsubzoneselect.options[subsubzoneselect.selectedIndex].text + " - ";
    insertPN();
    //      The following was moved to the mainrun() function so that it would make a GET request everytime the fault page would load.  This is because its currently being used to collect statistics on who is using the extension
    //    getDefinedFaults();
}

function redHighlight(selectedelement) {
    if (selectedelement.value == 0) {
        selectedelement.setAttribute("style", "background-color:red;color:white;");
        //            selectedelement.style.Color = '#FFFFFF';
    } else {
        selectedelement.setAttribute("style", "background-color:white;color:black;");
        //        selectedelement.style.backgroundColor = 'none';
    }
}

function corrActionBox() {
    actionbox = document.getElementById("idFieldAction");
    actionbox.rows = 10;
    actionbox.cols = 100;
    actionbox.setAttribute("style", "font-size:18px");
}

//Keep an eye on this.  Im sure the new version of Maintenix with its baselined N/A steps is going to fuck this right up
function makeActions() {
    altstepstatus = {}
    document.getElementById("idButtonGenerateAction").addEventListener("click", function () {
        makeActions()
    });
    complete = [];
    complete.pop();
    var partial = [];
    notapplic = [];
    steplist = document.getElementById("idTableSteps").children[0];
    numsteps = steplist.children.length;
    offset = 0;
    //    console.log(numsteps)
    for (i = 1; i < numsteps; i++) {
        tbodyelement = document.getElementById("idTableSteps").children[0];
        //                console.log(tbodyelement.children[i]);
        rowelement = tbodyelement.children[i];
        //                console.log(rowelement)
        dataelement = rowelement.children[0];
        //        console.log(dataelement.rowSpan);
        offset1 = dataelement.rowSpan - 1;
        //        console.log("offset "+offset);
        //        console.log("i "+i);
        //        console.log("offset1 "+offset1);
        //        console.log("---");
        i = i - offset;
        if (isJobStop() === true) {
            noteoffset = 0;
        } else {
            noteoffset = 1;
            //                        idd = idd + 1;
        }
        if (document.getElementById("idSelect" + (i + 2 - noteoffset)).selectedIndex != stepstatus[i]) {
            if (document.getElementById("idSelect" + (i + 2 - noteoffset)).selectedIndex == 2) {
                complete.push(i);
            } else if (document.getElementById("idSelect" + (i + 2 - noteoffset)).selectedIndex == 1) {
                partial.push(i);
            } else if (document.getElementById("idSelect" + (i + 2 - noteoffset)).selectedIndex == 3) {
                notapplic.push(i);
            }
        }
        if (document.getElementById("idSelect" + (i + 2 - noteoffset)).selectedIndex == 1 && document.getElementById("idSelect" + (i + 2 - noteoffset)).selectedIndex == stepstatus[i] && document.getElementsByName("aNewNote_" + i)[0].value != '') {
            partial.push(i);
        }
        offset = offset + offset1;
        //        console.log(offset);
        i = i + offset;
    }
    actionbox = document.getElementById("idFieldAction");
    if (complete.length > 1) {
        completetext = "COMPLETED JOB CARD STEPS " + complete.valueOf();
    } else {
        completetext = "COMPLETED JOB CARD STEP " + complete.valueOf();
    }
    if (partial.length > 1) {
        partialtext = "PARTIALLY COMPLETED JOB CARD STEPS " + partial.valueOf();
    } else {
        partialtext = "PARTIALLY COMPLETED JOB CARD STEP " + partial.valueOf();
    }
    if (notapplic.length > 1) {
        notapplictext = "JOB CARD STEPS " + notapplic.valueOf() + " ARE NOT APPLICABLE";
    } else {
        notapplictext = "JOB CARD STEP " + notapplic.valueOf() + " IS NOT APPLICABLE";
    }
    var actionboxtext = '';
    if (complete.length != 0) {
        actionboxtext = actionboxtext + completetext;
        if (partial.length != 0 || notapplic.length != 0) {
            actionboxtext = actionboxtext + "\n";
        }
    }
    if (partial.length != 0) {
        actionboxtext = actionboxtext + partialtext;
        if (notapplic.length != 0) {
            actionboxtext = actionboxtext + "\n";
        }
    }
    if (notapplic.length != 0) {
        actionboxtext = actionboxtext + notapplictext;
    }
    actionbox.value = actionboxtext;

}

function jobStepWarning(itemid) {
    if (isJobStop() === true) {
        noteoffset = 0;
    } else {
        noteoffset = 1;
        //                        idd = idd + 1;
    }
    if (document.getElementsByName("aNewNote_" + itemid)[0].value == '' && (document.getElementById("idSelect" + (itemid + 2 - noteoffset)).selectedIndex == 1 || document.getElementById("idSelect" + (itemid + 2 - noteoffset)).selectedIndex == 3)) {
        document.getElementsByName("aNewNote_" + itemid)[0].style.background = '#ff2a33';
    } else {
        document.getElementsByName("aNewNote_" + itemid)[0].style.background = 'white';
    }
}

function taskCompleteWords() {
    actionbox = document.getElementById("idFieldAction");
    actionboxtext = actionbox.value;
    actionbox.value = actionboxtext + "\n\nTASK COMPLETE";
}
//Determine whether a page is a job stop or finish.  Helpful when sorting out issues with tables
function isJobStop() {
    maintable = document.getElementById("idGBox1");
    nextchild = maintable.firstChild;
    firstheader = nextchild.firstChild;
    if (firstheader.id == "idHeaderRow_idGrpJobStop")
        return true
    else
        return false

}


function buttonInsert() {
    //Before I knew how to use the createelement function.  Its rubbish, but it works
    genactionbutton = "<a id=\"idButtonGenerateAction\" title=\"Generate Action\" href=\"#\" class=\"largeButton\" style=\"\"><span class=\"largeButtonTextCell\">Generate Action</span></a>";
    taskComplete = "<a id=\"idButtonTaskComplete\" title=\"Task Complete\" href=\"#\" class=\"largeButton\" style=\"\"><span class=\"largeButtonTextCell\">Task Complete</span></a>";
    stepsarea = document.getElementById("idContentRow_idGrpJicSteps");
    childs = stepsarea.children[0];
    for (i = 0; i < 8; i++) {
        childs = childs.children[0];
    }
    a = childs.innerHTML;
    childs.innerHTML = a + genactionbutton + taskComplete;
    document.getElementById("idButtonGenerateAction").addEventListener("click", function () {
        makeActions()
    });
    document.getElementById("idButtonTaskComplete").addEventListener("click", function () {
        taskCompleteWords()
    });
    steplist = document.getElementById("idTableSteps").children[0];
    //    console.log(steplist);
    numsteps = steplist.children.length;
    //    console.log(numsteps);
    //    if (isJobStop() === true)
    //    {
    //        offset = 0;
    //    }
    //    else
    //    {
    //        offset = 1;
    //    }
    offset = 0;
    for (i = 1; i < numsteps; i++) {
        tbodyelement = document.getElementById("idTableSteps").children[0];
        //                console.log(tbodyelement.children[i]);
        rowelement = tbodyelement.children[i];
        //                console.log(rowelement)
        dataelement = rowelement.children[0];
        //                console.log(dataelement.rowSpan);
        offset1 = dataelement.rowSpan - 1;

        //                console.log(offset);
        //                console.log(offset1);
        //                console.log("i = "+i);
        //                console.log(i-offset);

        //                i=i+offset;

        (function (idd) {
            //This if statement fixes the issue with job card step status boxes being identified differently on job stop and finish. any changes here may need to be replicated in jobStepWarning()
            if (isJobStop() === true) {
                noteoffset = 0;
            } else {
                noteoffset = 1;
                //                        idd = idd + 1;
            }
            status = document.getElementById("idSelect" + (idd + 2 - noteoffset));

            //                    console.log(noteoffset);
            stepstatus[idd] = document.getElementById("idSelect" + (idd + 2 - noteoffset)).selectedIndex;
            console.log("i" + idd);

            document.getElementById("idSelect" + (idd + 2 - noteoffset)).addEventListener("change", function () {
                jobStepWarning(idd)
            }, false);
            document.getElementsByName("aNewNote_" + idd)[0].addEventListener("keyup", function () {
                jobStepWarning(idd)
            })
        }(i - offset));
        offset = offset + offset1;
        i = i + offset1;
        //                console.log("---------");
        //            console.log(document.getElementById("idSelect" + (i+2)).selectedIndex);
    }

}

//    Get the inventory type.  This will help when we need to narrow down defined faults later.  It returns the AC type i.e "A330" or "737"
//    Added a function in here to cope with the A320 family of aircraft.  So we dont have to duplicate the database for the 320 or 321, whenever we detect A32 in idCellAircraftInventory we will return "A320" as the inventory
//    Added a bandaid in here to return "HAL" for HA aircraft.  This is so that we can have seperate naming conventions for the HALs 
function aircraftType() {
    var inventoryRE = new RegExp(/N([0-9]){3}HA/);
    inventory = document.getElementById("idCellAircraftInventory").childNodes[1].innerHTML;
    inventoryspace = inventory.indexOf(" ");
    inventorydash = inventory.indexOf("-");
    inventory = inventory.substring(inventoryspace + 1, inventorydash);
    if (inventory.substr(0, 3) == "A32") {
        inventory = "A320";
    }
    if (inventoryRE.test(document.getElementById("idCellAircraftInventory").childNodes[1].innerHTML) == true){
        inventory = "HAL";
    }
    console.log(inventory);
    return inventory;
}

//Function to add a job code to the input box and then click the OK button
function addJobNumber(number) {
    inputbox = document.getElementById("idAccount");
    inputbox.value = number;
    location.href = "javascript:onClick_idAddAccount(); void 0";
}

//Generates The buttons for commonly used job codes.  Define the jobcodes at the bottom of the script
function quickJobButtons() {
    //    console.log(jobcodes);
    for (job in jobcodes) {
        //        console.log(jobcodes[job]);
        newbutton = document.createElement("Button");
        newbutton.id = "insert" + jobcodes[job]
        newbutton.className = "mxlikebutton";
        (function () {
            var newnum = jobcodes[job];
            newbutton.addEventListener("click", function () {
                addJobNumber(newnum)
            });
        }());
        codetext = document.createTextNode(job);
        newbutton.appendChild(codetext);
        maindiv = document.getElementById("idPostHeaderSection");
        maindiv.appendChild(newbutton);
    }
}

//Create a place to put a read only box for the naming conventions.  Another example of a feature that wasnt implemented due to my hurt feelings
function createReadOnlyNamingConvention() {
    qfbrow = document.getElementById("quickrow");
    console.log(qfbrow.nextSibling);
    rocell = qfbrow.nextSibling.insertCell(1);
    qfbrow.nextSibling.insertCell(3);
    rocell.id = "bm_rocell";
    cellwithfaultname = document.getElementById("idCellFaultName").parentNode;
    cellwithfaultname.setAttribute("colspan", "2");
    //    var robox = document.createElement("input");
    //    rocell.appendChild(robox);
    //    robox.readOnly = true;
    document.getElementById("idCellFaultName").style.width = "330px";
    //    cellwithfaultname.removeAttribute("colspan");


}

function betterFaults() {
    //    Defines the areas, trades and categories.  Havent moved this to a DB lookup as it should be fairly static
    arealist = ["CAB", "LWE", "RWE", "MOR", "BAGS", "EMP", "FUS", "IFE"];
    tradelist = ["AF", "AV", "SM", "ND", "FGAC", "FGBS", "PT", "UT", "FT", "FU"];
    catlist = ["*** GREEN ***", "*** AMBER ***", "*** RED ***", "*** ERES ***"]
    regotable = document.getElementById("idTableFaultRegistration");
    parenttask = document.getElementById("idCellFoundDuringTask").childNodes[1].innerHTML;
    parenttaskspace = parenttask.indexOf(" ");
    parenttask = parenttask.substring(0, parenttaskspace);
    var quickrow = regotable.insertRow(1);
    quickrow.id = "quickrow";
    quickrow = document.getElementById("quickrow");
    var cell1 = quickrow.insertCell(0);
    cell1.className = "paraHeader formFirstCol optional";
    var cell2 = quickrow.insertCell(1);
    cell2.setAttribute("colspan", "3")
        //    quickrow.insertCell(2);
    cell1.innerHTML = "Quick Fault Builder:";
    var workareaselect = document.createElement("select");
    workareaselect.id = "bm_areaselect"
    cell2.appendChild(workareaselect);
    var tradeselect = document.createElement("select");
    tradeselect.id = "bm_tradeselect"
    cell2.appendChild(tradeselect);
    var catselect = document.createElement("select");
    catselect.id = "bm_catselect"
    cell2.appendChild(catselect);

    var zoneselect = document.createElement("select");
    zoneselect.id = "bm_zoneselect"
    cell2.appendChild(zoneselect);

    var subzoneselect = document.createElement("select");
    subzoneselect.id = "bm_subzoneselect"
    cell2.appendChild(subzoneselect);

    var subsubzoneselect = document.createElement("select");
    subsubzoneselect.id = "bm_subsubzoneselect"
    cell2.appendChild(subsubzoneselect);

    var definitionspan = document.createElement("span");
    definitionspan.id = "definitionarea";
    cell2.appendChild(definitionspan);
    //	var opt3 = document.createElement("option")
    //	workareaselect.appendChild(opt3);

    document.getElementById("bm_areaselect").addEventListener("change", function () {
        addAreaToTitle()
    });
    document.getElementById("bm_tradeselect").addEventListener("change", function () {
        addAreaToTitle()
    });
    document.getElementById("bm_catselect").addEventListener("change", function () {
        addAreaToTitle()
    });
    document.getElementById("bm_zoneselect").addEventListener("change", function () {
        getSubZones()
    });
    document.getElementById("bm_subzoneselect").addEventListener("change", function () {
        getSubSubZones()
    });
    document.getElementById("bm_subsubzoneselect").addEventListener("change", function () {
        addSubSubZone()
    });
    for (i = 0; i < arealist.length; i++) {
        var opt = document.createElement("option");
        var newopt = document.createTextNode(arealist[i]);
        opt.appendChild(newopt);
        workareaselect.appendChild(opt);
    }
    for (i = 0; i < tradelist.length; i++) {
        var opt = document.createElement("option");
        var newopt = document.createTextNode(tradelist[i]);
        opt.appendChild(newopt);
        tradeselect.appendChild(opt);
    }
    for (i = 0; i < catlist.length; i++) {
        var opt = document.createElement("option");
        var newopt = document.createTextNode(catlist[i]);
        opt.appendChild(newopt);
        catselect.appendChild(opt);
    }
    //	document.getElementById("idLabelFaultSource").parentNode.style.display = "none";
    //	document.getElementById("idLabelLogbookType").parentNode.style.display = "none";
    //	document.getElementById("idLabelRecurrenceOf").parentNode.style.display = "none";
    //	document.getElementById("idLabelFaultPriority").style.visibility = "collapse";
    //	document.getElementById("idSelect8").style.visibility = "collapse";
    //	document.getElementById("idLabelFlightSafetyImpact").parentNode.style.display = "none";
    //	resultingeventsbandhead = document.getElementById("idGrpResultingEvents").parentNode;
    //	resultingeventsbandbody = resultingeventsbandhead.nextElementSibling;
    //	resultingeventsbandhead.style.display = "none";
    //	resultingeventsbandbody.style.display = "none";
    //	whattodobandhead = document.getElementById("idGrpWhatToDo").parentNode;
    //	whattodobandbody = whattodobandhead.nextElementSibling;
    //	whattodobandbody.style.display = "none";
    //	whattodobandhead.style.display = "none";
    if (document.getElementById("idCellFaultName").value == '') {
        document.getElementById("idCellFaultName").value = "CAB AF *** GREEN *** ";
        document.getElementById("idSelect9").value = "MECH";
        getStoredFaults("CAB", "AF", aircraftType());

    } else {
        refreshitems = mapTitleTrade()
    }

    //	document.getElementById("idSelect9").value = "AVIONICS";
    document.getElementById("idLabelScheduledHours").style.display = "";
    document.getElementById("idCellScheduledHours").style.display = "";
    //	document.getElementById("idLabelLogbookRef").style.display = "none";
    //	document.getElementById("idInput23").style.display = "none";
    document.getElementById("idCellFaultName").focus();
    getStoredFaults(refreshitems[0], refreshitems[1], aircraftType());
    document.getElementById("bm_zoneselect").style.display = "none";
    document.getElementById("bm_subzoneselect").style.display = "none";
    document.getElementById("bm_subsubzoneselect").style.display = "none";
    //    createReadOnlyNamingConvention()
}

function seperateTitle(faulttitle) {
    stars = faulttitle.lastIndexOf("***");
    lastspace = faulttitle.indexOf(" ", stars + 5);
    //    lastspace = faulttitle.indexOf("-");
    return lastspace;
}

function betterTimeSheet() {
    var inputboxes = document.getElementsByName("aMxHours");
    var nonMXinputboxes = document.getElementsByName("aNonMxHours");
    var i;
    for (i = 0; i < inputboxes.length; i++) {
        inputboxes[i].setAttribute("tabIndex", i + 1);
        redHighlight(inputboxes[i]);
        //        inputboxes[i].setAttribute("onblur", "redHighlight(this)")
    }
    for (i = 0; i < nonMXinputboxes.length; i++) {
        nonMXinputboxes[i].setAttribute("tabIndex", i + 1 + inputboxes.length);
        redHighlight(nonMXinputboxes[i]);
    }
    inputboxes[0].focus();
    tables = document.getElementsByClassName("formTable");
    for (i = 0; i < tables.length; i++) {
        tables[i].style.width = "97%";
        tables[i].style.minWidth = "800px"
    }
}

function betterTaskDetails() {
    labourtable = document.getElementById("idTableLaborList");
    labourbodyelement = labourtable.children[0];
    labourrowelements = labourbodyelement.children;
    offset = 0;
    for (i = 2; i < labourrowelements.length; i++) {
        tradecell = labourrowelements[i].children[1];
        stagecell = labourrowelements[i].children[2];
        if (tradecell.innerHTML == "AVIONICS" || tradecell.innerHTML == "ELECT") {
            for (rowloop = 0; rowloop < tradecell.rowSpan; rowloop++) {
                if (labourrowelements[i].className == "whiteBackground") {
                    //					labourrowelements[i+rowloop].style.backgroundColor = "#66ff66";
                    labourrowelements[i].className = "avlight";
                } else {
                    labourrowelements[i].className = "avdark";
                }
            }
        } else if (tradecell.innerHTML == "MECH" || tradecell.innerHTML == "CABIN" || tradecell.innerHTML == "PPLANT" || tradecell.innerHTML == "BORO") {
            for (rowloop = 0; rowloop < tradecell.rowSpan; rowloop++) {
                if (labourrowelements[i].className == "whiteBackground") {
                    labourrowelements[i].className = "mechlight";
                } else {
                    labourrowelements[i].className = "mechdark";
                }
            }
        } else if (tradecell.innerHTML == "SHMTL" || tradecell.innerHTML == "STRUCT") {
            for (rowloop = 0; rowloop < tradecell.rowSpan; rowloop++) {
                if (labourrowelements[i].className == "whiteBackground") {
                    labourrowelements[i].className = "sheetylight";
                } else {
                    labourrowelements[i].className = "sheetydark";
                }
            }
        } else if (tradecell.innerHTML == "UTILITY") {
            for (rowloop = 0; rowloop < tradecell.rowSpan; rowloop++) {
                if (labourrowelements[i].className == "whiteBackground") {
                    labourrowelements[i].className = "utilitylight";
                } else {
                    labourrowelements[i].className = "utilitydark";
                }
            }
        }
        //      This is commented out for now.  Its job was to hide all TMSHT labour rows on the task execution page.  The current policy with this extension is that it should not hide anything that was initially presented to the user by the maintenix designers.  As such, this will be left here in case that policy changes in the future
        //		else if (tradecell.innerHTML == "TMSHT")
        //		{
        //            labourrowelements[i].style.display = "none";
        //		}
        else if (tradecell.innerHTML == "COMPOSIT") {
            for (rowloop = 0; rowloop < tradecell.rowSpan; rowloop++) {
                if (labourrowelements[i].className == "whiteBackground") {
                    labourrowelements[i].className = "compositelight";
                } else {
                    labourrowelements[i].className = "compositedark";
                }
            }
        } else if (tradecell.innerHTML == "PAINT") {
            for (rowloop = 0; rowloop < tradecell.rowSpan; rowloop++) {
                if (labourrowelements[i].className == "whiteBackground") {
                    labourrowelements[i].className = "paintlight";
                } else {
                    labourrowelements[i].className = "paintdark";
                }
            }
        } else if (tradecell.innerHTML == "NDI") {
            for (rowloop = 0; rowloop < tradecell.rowSpan; rowloop++) {
                if (labourrowelements[i].className == "whiteBackground") {
                    labourrowelements[i].className = "ndilight";
                } else {
                    labourrowelements[i].className = "ndidark";
                }
            }
        }
        if (stagecell.innerHTML == "IN WORK") {
            classhold = labourrowelements[i].className;
            newclass = classhold + " inworkclass";
            labourrowelements[i].className = newclass;
        }
        if (tradecell.rowSpan > 1) {
            for (subrows = 1; subrows < tradecell.rowSpan; subrows++) {
                labourrowelements[i + subrows].className = labourrowelements[i].className
            }
            i = i + tradecell.rowSpan - 1;
        }
    }
}

function addAreaToTitle() {
    var skillbox = document.getElementById("idSelect9");
    var tradeselect = document.getElementById("bm_tradeselect");
    var areaselect = document.getElementById("bm_areaselect");
    var tradeselect = document.getElementById("bm_tradeselect");
    var catselect = document.getElementById("bm_catselect");
    var titlebox = document.getElementById("idCellFaultName");
    getStoredFaults(areaselect.value, tradeselect.value, aircraftType());
    //    seperateTitle(titlebox.value);
    //    console.log("a "+storedfaults[1]);
    if (titlebox.value.lastIndexOf("***") > 1) {
        //		title = titlebox.value.slice(titlebox.value.lastIndexOf("***") + 4);
        title = titlebox.value.slice(seperateTitle(titlebox.value))
        titlebox.value = areaselect.value + " " + tradeselect.value + " " + catselect.value + " " + title;
        //        titlebox.value = tradeselect.value + " " +catselect.value + " " + areaselect.value+" " +title;
    } else {
        //		title = titlebox.value.slice(titlebox.value.lastIndexOf("***") + 4);
        title = titlebox.value.slice(seperateTitle(titlebox.value))
        titlebox.value = areaselect.value + " " + tradeselect.value + " " + catselect.value + " " + title;
    }
    //	console.log(tradeselect.value);
    //    titlebox.value = areaselect.value + " " +tradeselect.value + " " +catselect.value;
    if (tradeselect.value == "AV") {
        skillbox.value = "AVIONICS";
    } else if (tradeselect.value == "AF") {
        skillbox.value = "MECH";
        if (areaselect.value == "CAB") {
            skillbox.value = "CABIN";
        }
    } else if (tradeselect.value == "SM") {
        skillbox.value = "SHMTL";
    } else if (tradeselect.value == "ND") {
        skillbox.value = "NDI";
    } else if (tradeselect.value == "FGAC" || tradeselect.value == "FGBS") {
        skillbox.value = "COMPOSIT";
    } else if (tradeselect.value == "PT") {
        skillbox.value = "PAINT";
    } else if (tradeselect.value == "UT") {
        skillbox.value = "UTILITY";
    } else if (tradeselect.value == "FT") {
        skillbox.value = "FITTING";
    } else if (tradeselect.value == "FU") {
        skillbox.value = "ACFURN";
    }
    insertPN()

}

//this is the fix for the selected trade regression when navigating away from the Rasie Fault Page
function mapTitleTrade() {
    var titlebox1 = document.getElementById("idCellFaultName");
    var tradeselect1 = document.getElementById("bm_tradeselect");
    var areaselect1 = document.getElementById("bm_areaselect");
    spacepriortotrade = titlebox1.value.indexOf(" ");
    //    spaceaftertrade = titlebox1.value.indexOf(" ");
    spaceaftertrade = titlebox1.value.indexOf(" ", spacepriortotrade + 1);
    actualtradecode = titlebox1.value.substring(spacepriortotrade + 1, spaceaftertrade);
    tradeselect1.value = actualtradecode;
    //    areacodestart = titlebox1.value.lastIndexOf("***")+4;
    areacodeend = titlebox1.value.indexOf(" ");
    actualareacode = titlebox1.value.substring(0, areacodeend)
        //    console.log(actualareacode);
        //    console.log(actualtradecode);
    areaselect1.value = actualareacode;
    return [actualareacode, actualtradecode]
        //    getStoredFaults(areaselect.value, tradeselect.value, aircraftType());

}

//This function is included to provision for future preference functions based on user staff number
function getSettings(staffno) {
    var xsXML = new XMLHttpRequest();
    xsXML.open("GET", "https://av-it-services.com/faultstore/prefs.php?usr=" + staffno, true); {
        if (xhr.readyState == 4) {

            var resp = JSON.parse(xhr.responseText);
            console.log(resp)
        }
    }
    xhr.send();

}

//Determine if its a task definition Add Step page
function isTaskDefn() {
    pathis = window.location.pathname;
    if (pathis.indexOf("taskdefn") != -1) {
        return true
    } else {
        return false
    }
}

//Add the controls for enhanced task def step creation
function addStepEnhancement() {
    actionbox = document.getElementById("idDescription");
    actionbox.rows = 25;
    actionbox.cols = 100;
    actionbox.addEventListener("keyup", charCounter);
    maintable = document.getElementById("idGBox1");
    maintablebody = maintable.firstChild;
    newheaderrow = document.createElement("tr");
    maintablebody.appendChild(newheaderrow);
    newheaderrow.className = "formHeaderRow";
    newheaderdata = document.createElement("td");
    newheaderdata.innerHTML = "Formatting";
    newheaderrow.appendChild(newheaderdata);

    formattingsectrow = document.createElement("tr");
    maintablebody.appendChild(formattingsectrow);

    formattingsectdata = document.createElement("td");
    formattingsectdata.style.margin = "auto";
    formattingsectrow.appendChild(formattingsectdata);

    textboxtd = actionbox.parentElement;
    charcountspan = document.createElement("span");
    charcountspan.style.display = "block";
    charcountspan.id = "id_charcounter";
    textboxtd.appendChild(charcountspan);
    charcountspan.innerHTML = "0/3000";
    //    controldiv.style.cssFloat = "right";
    //    document.getElementById("idForm1").appendChild(controldiv);
    for (action in markups) {
        newbutton = document.createElement("Button");
        newbutton.id = "id_button_" + action;
        newbutton.innerHTML = action;
        newbutton.className = "mxlikebutton";
        (function () {
            var element = markups[action];
            newbutton.addEventListener("click", function () {
                wrapSelection(element)
            });
        }());
        //        function () 
        //            {
        //            var element = markups[action];
        //            newbutton.addEventListener("click", function() {wrapSelection(element)});
        //            };
        formattingsectdata.appendChild(newbutton);
    }
    previewheaderrow = document.createElement("tr");
    maintablebody.appendChild(previewheaderrow);
    previewheaderrow.className = "formHeaderRow";
    previewheaderrowdata = document.createElement("td");
    previewheaderrow.appendChild(previewheaderrowdata);
    previewheaderrowdata.innerHTML = "Preview";
    previewrow = document.createElement("tr");
    maintablebody.appendChild(previewrow);
    previewrowdata = document.createElement("td");
    previewrow.appendChild(previewrowdata);
    previewrowdata.id = "id_previewbox";

    newbutton = document.createElement("button");
    newbutton.id = "id_button_unorderedlist";
    newbutton.addEventListener("click", function () {
        makeList("ul")
    });
    newbutton.innerHTML = "Unordered List";
    newbutton.className = "mxlikebutton";
    formattingsectdata.appendChild(newbutton);

    newbutton = document.createElement("button");
    newbutton.id = "id_button_orderedlist";
    newbutton.addEventListener("click", function () {
        makeList("ol")
    });
    newbutton.innerHTML = "Ordered List";
    newbutton.className = "mxlikebutton";
    formattingsectdata.appendChild(newbutton);

}

//Function to return the highlighted section of a textarea
function getSel() {
    txtarea = document.getElementById("idDescription");
    start = txtarea.selectionStart;
    finish = txtarea.selectionEnd;
    sel = txtarea.value.substring(start, finish);
    //    console.log(start);
    //    console.log(finish);
    return [start, finish]
}

//Wrap selected text with defined tags
function wrapSelection(element) {
    a = getSel();
    //    console.log(element);
    opentag = "<" + element + ">";
    if (element.indexOf("span") != -1) {
        closetag = "</span>";
    } else {
        closetag = "</" + element + ">";
    }
    txtarea = document.getElementById("idDescription");
    beforeselection = txtarea.value.substring(0, a[0]);
    afterselection = txtarea.value.substring(a[1]);
    selection = txtarea.value.slice(a[0], a[1]);
    //    console.log(beforeselection);
    //    console.log(selection);
    //    console.log(afterselection);
    selection = opentag + selection + closetag;
    txtarea.value = beforeselection + selection + afterselection;
    charCounter();
}

//This function runs on every keyup event in the text area.  It also runs the preview box
function charCounter() {
    counterspan = document.getElementById("id_charcounter");
    length = document.getElementById("idDescription").value.length;
    counterspan.innerHTML = length + "/3000";
    //    console.log(txtarea.value.length);
    rawtext = document.getElementById("idDescription").value;
    rawtext = rawtext.replace(/\n/g, "<br>");
    document.getElementById("id_previewbox").innerHTML = rawtext;
}


//This puts a list where the cursor is
function makeList(type) {
    go = 1;
    wholelist = "";
    opentag = "<" + type + ">";
    closetag = "</" + type + ">";
    while (go == 1) {
        listitem = prompt("Enter a list item.  Leave the field blank or press cancel to finish");
        if (listitem == null || listitem == "") {
            go = 0;
        } else {
            wholelist = wholelist + "<li>" + listitem + "</li>";
            //            console.log(listitem);
            //            console.log(go);

        }
    }
    cursor = getSel();
    beforeselection = txtarea.value.substring(0, cursor[0]);
    afterselection = txtarea.value.substring(cursor[1]);
    selection = txtarea.value.slice(cursor[0], cursor[1]);
    selection = opentag + wholelist + closetag;
    txtarea.value = beforeselection + selection + afterselection;
    charCounter();
    //    console.log("<ul>"+wholelist+"</ul>")
}


//Go to a task in a new tab
function goToTask(barcode) {
    barcodebox = document.getElementById("idBarcodeSearchInput");
    barcodesearchform = document.getElementsByName("frmHeaderSearch")[0];
    barcodebox.value = barcode;
    barcodesearchform.setAttribute("target", "_blank");
    barcodesearchform.submit();
    barcodesearchform.removeAttribute("target");
    barcodebox.value = '';
    barcodebox.setAttribute("placeholder", "Barcode Search");


}


//This is a bit of trainwreck at the moment.  The idea is that because we apply the same rules to actions field as we do to the step notes to find and tag barcodes, we should have a single function to do it and then just call that twice.  
function parseTheBox(boxid) {
    var barcodeRE = new RegExp(/\sT([a-z]|[0-9]){7}(\s|\.|$)/ig);
    //    matchloc = singlediv.search(/\sT([a-z]|[0-9]){7}(\s|\.)/ig);
    singlediv = document.getElementById(boxid).innerHTML;
    matchloc = singlediv.search(barcodeRE);
    lastindex = 0;
    linkcounter = 0;
    
    stringlocations = new Array();
    while (matchloc != -1) {
        if (matchloc == -1){break;}
        
        stringoffset = linkcounter*63+lastindex;
        leadingstring = document.getElementById(boxid).innerHTML.slice(0, matchloc + 1+stringoffset);
        barcodestring = document.getElementById(boxid).innerHTML.slice(matchloc + 1+stringoffset, matchloc + 9+stringoffset);
        trailingstring = document.getElementById(boxid).innerHTML.slice(matchloc + 9+stringoffset);
//        stringlocations.push(barcodestring);
        stringlocations[barcodestring] = matchloc+lastindex;
        lastindex = matchloc;
//        console.log(stringlocations);
//        console.log(matchloc);
        
    
        singlediv = singlediv.slice(lastindex+9);
//        console.log(singlediv);
        matchloc = singlediv.search(barcodeRE);
//        console.log(stringlocations);
//        console.log(lastindex);
//        console.log(leadingstring);
//        console.log(barcodestring);
//        console.log(trailingstring);
//        for(x=0;x<stringlocations.length;x++){
    //        trailingstring = singlediv.slice(matchloc + 9);
            span = "<span class=\"barcodelink\" id=\"id_goto" + barcodestring + "\">";
            newstring = leadingstring + span + barcodestring + "</span>" + trailingstring;
            console.log(newstring);
            document.getElementById(boxid).innerHTML = newstring;
            
            
//        }
    linkcounter++;
    }
//    console.log(document.getElementById(boxid))
    spans = document.getElementById(boxid).getElementsByTagName("span");
    console.log(spans.length);
    if(spans.length > 0){
    for (singlespan=0;singlespan<spans.length;singlespan++){
        (function () {
            console.log(singlespan);
                var barcodestringa = spans[singlespan].innerHTML;
                spanbyid = document.getElementById("id_goto" + barcodestringa);
//                var barcodestringa = barcodestring;
                console.log(barcodestringa);
                spanbyid.addEventListener("click", function () {
                    goToTask(barcodestringa)
                });
            }());
    }}
    
}

//Search all actions for barcodes and make them clickable links
function findBarcodes() {
    actionsarea = document.getElementById("idBandTaskAction");
    actiondivs = actionsarea.getElementsByClassName("notes");
    for (x = 0; x < actiondivs.length; x++) {
        singlediv = actiondivs[x].innerHTML;
        actiondivs[x].id = "BM_actiondiv"+x;
        matchloc = singlediv.search(/\sT([a-z]|[0-9]){7}(\s|\.)/ig);
        //        console.log(x);
        //        console.log(matchloc);
        //        console.log(singlediv.substr(matchloc+1, 8));
        //        console.log(singlediv);
//        if (matchloc != -1) {
//            leadingstring = singlediv.slice(0, matchloc + 1);
//            barcodestring = singlediv.slice(matchloc + 1, matchloc + 9);
//            trailingstring = singlediv.slice(matchloc + 9);
//            span = "<span class=\"barcodelink\" id=\"id_goto" + barcodestring + "\">";
//            newstring = leadingstring + span + barcodestring + "</span>" + trailingstring;
//            actiondivs[x].innerHTML = newstring;
//            spanbyid = document.getElementById("id_goto" + barcodestring);
//            (function () {
//                var barcodestringa = barcodestring;
//                spanbyid.addEventListener("click", function () {
//                    goToTask(barcodestringa)
//                });
//            }());
//
//        }
        parseTheBox(actiondivs[x].id)
    }
    tablestepsarea = document.getElementById("idTableSteps");
    tablerows = tablestepsarea.getElementsByTagName("tr");
    for (x = 1; x < tablerows.length; x++) {
        rowdata = tablerows[x].getElementsByTagName("td");
        //            console.log(x);
        //            console.log(rowdata.length);
        if (rowdata.length == 5) {
            notecell = 4;
        } else {
            notecell = 1;
        }
        //            console.log(rowdata[notecell].innerHTML)
        stepnote = rowdata[notecell].innerHTML;
        matchloc = stepnote.search(/\sT([a-z]|[0-9]){7}/ig);
//        console.log(x);
        stepnotediv = rowdata[notecell].firstChild;
        stepnotediv.id = "BMstepnotediv"+x;
//        console.log(stepnotediv);
        parseTheBox(stepnotediv.id);
        //        console.log(x);
        //        console.log(matchloc);
        //        console.log(singlediv.substr(matchloc+1, 8));
        //        console.log(singlediv);
//        if (matchloc != -1) {
//            leadingstring = stepnote.slice(0, matchloc + 1);
//            barcodestring = stepnote.slice(matchloc + 1, matchloc + 9);
//            trailingstring = stepnote.slice(matchloc + 9);
//            span = "<span class=\"barcodelink\" id=\"id_goto" + barcodestring + "\">";
//            newstring = leadingstring + span + barcodestring + "</span>" + trailingstring;
//            rowdata[notecell].innerHTML = newstring;
//            spanbyid = document.getElementById("id_goto" + barcodestring);
//            (function () {
//                var barcodestringa = barcodestring;
//                spanbyid.addEventListener("click", function () {
//                    goToTask(barcodestringa)
//                });
//            }());
//
//        }
    }
}



//This runs on every page load...  Its job is to determine the page title and the user and then enable the correct enhancements for that page.
//It also grabs the users staff number.  Its a provision for user settings specific settings in the future.  The idea is a setting is stored on the server and can then follow the user to different computers
function mainrun() {
    betatesters = ["Gavin Jamieson", "Charles Laczina", "Timothy Baker", "Colin Ryan", "Richard Crossley", "Johannes Deysel", "Shane Finigan", "Owen Gilmour", "Zoran Jajcevic", "Wayne Lawson", "Gregory Nelson", "Michael Everist", "Abraham Hatzakortzian"];
    usrname = document.getElementsByClassName("username-display")[0].innerHTML;
    document.getElementsByClassName("username-display")[0].innerHTML = usrname + "<b> Enhanced Mode</b>";
    var strwithnumber = document.getElementsByClassName("headerMenuTitle")[0].href;
    var staffnostart = strwithnumber.indexOf("u=");
    var staffno = strwithnumber.substr(staffnostart + 2, 6);
    //    console.log(usrname.split(" (Qantas)"));

    if (document.getElementById("idMxTitle").innerHTML == "Timesheets") {
        betterTimeSheet();
    }
    if (document.getElementById("idMxTitle").innerHTML == "Work Capture") {
        corrActionBox();
        buttonInsert();
    } else if (document.getElementById("idMxTitle").innerHTML == "Raise Fault") {
        betterFaults();
    } else if (document.getElementById("idMxTitle").innerHTML == "Task Details" && betatesters.indexOf(usrname.split(" (Qantas)")[0]) != -1) {
        betterTaskDetails();
        getTechRefs();
        findBarcodes();
    } else if (document.getElementById("idMxTitle").innerHTML == "Add Non Maintenix Task Labour Booking") {
        quickJobButtons();

    } else if (document.getElementById("idMxTitle").innerHTML == "Add Step" && isTaskDefn() == true) {
        addStepEnhancement();
    }
}

//For the Timesheet enhancement, add the works order name and number to this KV list.  the J is important.
var jobcodes = {
    "Standing & Waiting": "J80000",
    "Hangar Cleaning": "J84000",
    "Supervision": "J334519",
    "Toolbox Meetings": "J268708",
    "Training": "J282083",
    "Unactioned Abscence": "J80073",
    "Read and Signs": "J290286",
    "Aids to Production": "J84101",
    "LH-Timesheets": "J80301",
    "Approved Non-Productive": "J277330",
    "Daily 5S": "J332506"
}

//For the Add Step Enhancement.
var markups = {
    "Embolden": "b",
    "Italicise": "i",
    "Underline": "u",
    "Center": "center",
    "Warning": "span style=\"color:red\"",
    "Caution": "span style=\"color:#FFC000\"",
    "Note": "span style=\"color:green\""
}
stepstatus = {}
mainrun();
//styleNightMode();
