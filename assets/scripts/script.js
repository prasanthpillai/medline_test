var medLine = window.medLine || {};

medLine.dataGrid = (function (w, d, $) {
    'use strict';
    // Private variables and methods
    var _this = {
        colProps: [],                       // Helper array to store column data
        rowsToDelete: [],                   // Helper array to store elements marked for deletion
        addColBtn: $("#addColumn"),
        delColBtn: $("#delColumn"),
        masterTable: $("#masterTable"),
        resultTable: $("#resultTable"),
        addForm :   $("#add-column-form"),
        addColModal: $("#addColumnModal"),
        checkBoxEl: $(".select-row"),
        // Get form values and convert to JSON
        getFormData : function(formEl){
            var obj = {};
            var elements = formEl.find("input, select");
            $.each(elements, function(i,el){
                var element = el[i];
                var name = el.name;
                var value = el.value;
                if(name) {
                    obj[name] = value;
                } 
            });
            return JSON.stringify(obj);
        },
        // Set the column data to a private array
        setGridData : function(){
            // An AJAX or REST code here can set data to server
            /*  $.ajax({
                    method: "POST",
                    url: "url/to/submit",
                    data: _this.getFormData(_this.addForm)
                })*/
            // Mock code below
            _this.colProps = [];
            _this.colProps.push(_this.getFormData(_this.addForm));
        },
        // Get the column data from array
        getGridData : function(){
            // An AJAX code here can fetch data from server
            /*   $.ajax({
                    method: "POST",
                    url: "url/to/fetch",
                    success: function(data){
                        return data;
                    }
                })*/
            // Here data is retrived from array for mocking
            return JSON.parse(_this.colProps);
        },
        // Helper method to generate column elements
        generateColumn: function(cell, data, i) {
            var element;
            if(i===0){
                element = d.createTextNode(data.colname);
            }else{
                var editable = data.editable == "true"?false:true;
                if(data.coltype !== "select"){
                    element = d.createElement("input");
                    element.setAttribute("type", data.coltype);
                    element.setAttribute("class","form-control");
                }else{
                    element = d.createElement("select");
                    element.setAttribute("class","form-control");
                    var optionT = d.createElement("option");
                    var optionF = d.createElement("option");
                    optionT.value = "1";
                    optionT.text = "Yes";

                    optionF.value = "0";
                    optionF.text = "No";

                    element.add(optionT, null);
                    element.add(optionF, null);
                }
                element.disabled = editable;
            }
            cell.appendChild(element);
        },
        // Add new row to master table 
        addNewRow : function (formEl) {
            var data= _this.getGridData();
            _this.masterTable.find('tr:last').after('<tr></tr>');
            _this.masterTable.find('tr:last').append("<td class='text-center'><input type='checkbox' class='select-row'></td>");
            $.each(data,function(i,v){
               _this.masterTable.find('tr:last').append("<td>"+v+"</td>");
            });
            _this.numberRows();
            _this.addNewCol();
        },
        // Create new column based on the JSON data
        addNewCol : function(){
            var data = _this.getGridData(),
            i;
            if(_this.resultTable.find('tr').length === 0){
                var j = 0;
                while(j <= 1){
                    _this.resultTable[0].insertRow(i);
                    j++;
                }
            }
            $(_this.resultTable[0].rows).each(function(i){
               var cols = _this.resultTable[0].rows[i].insertCell(_this.resultTable[0].rows[i].cells.length);
               cols.setAttribute('class', 'col');
               _this.generateColumn(cols, data, i, 'col');
               
            });
            _this.numberCols();
        },
        // Delete row from master table w.r.t elements in rowsToDelete array
        deleteRow: function(){
            $.each(_this.rowsToDelete, function(i,v){
                $("[data-row = "+v+"]").remove();
                _this.deleteCol(v);
            });
            _this.rowsToDelete = [];
            _this.numberRows();
            _this.numberCols();
            $("#selectAll").prop("checked", false);
        },
        // Delete column from result table w.r.t elements in rowsToDelete array
        deleteCol: function(cellId){
            var resTable = document.getElementById("resultTable");
            if(_this.resultTable.find("tr").length){
                _this.resultTable.find("tr").each(function(i,v){
                    $(this).find("td[data-col = "+cellId+"]").remove();
                });
            }
        },
        // Helper method to update rowsToDelete with marked items
        setRowsToDelete: function(){
            var delEl = $(".select-row:checked");
            _this.rowsToDelete = [];
            $.each(delEl, function(i, v){
                var rowId = $(v).closest('tr').attr('data-row');
                 if($(v).is(':checked')){
                    _this.rowsToDelete.push(rowId);
                }else{
                    for (var j=_this.rowsToDelete.length-1; j>=0; j--) {
                        if (_this.rowsToDelete[j] === rowId) {
                            _this.rowsToDelete.splice(j, 1);
                        }
                    }
                }
            });
        },
        // Helper method to number the rows in master table
        numberRows: function(){
            _this.masterTable.find('tr').each(function(i,v){
                $(this).attr('data-row', i);
            });
        },
        // Helper method to number the columns in result table
        numberCols: function(){
            _this.resultTable.find('tr').each(function(){
                $(this).find('td').each(function(i,v){
                    $(this).attr('data-col',i+1);
                });
            });
        },
        // Helper method to select/deselect all rows
        selectAll: function(){
            var selectedRows = $(".select-row");
            if($("#selectAll").is(':checked')){
                $(".select-row").prop("checked", true);
                _this.setRowsToDelete();
            }else{
                $(".select-row").prop("checked", false);
                _this.rowsToDelete = [];
            }
        }
    };
    // Public methods
    var api = {
        //Helper Array to store marked elements for deletion
        rowsToDelete: _this.rowsToDelete,
        //Method to add column
        addColumn: function(){
            _this.setGridData();
            _this.addNewRow();
            _this.addForm[0].reset();
            _this.addColModal.modal('hide');
        },
        // Method to delete column
        deleteColumn: function (rows) {  
            _this.deleteRow();
        },
        // Method for setting items for delete
        setRowsToDelete: function(delEl){
            _this.setRowsToDelete(delEl);
        },
        selectAll: _this.selectAll
    };

    return api;

})(window, document, jQuery);

// All events for the module
$(document).ready(function () {  
    $("#addColumn").on('click', function(){
        if($("#add-column-form").valid()){
            medLine.dataGrid.addColumn();
        }
    });
    $("#selectAll").on('change', function(){
        medLine.dataGrid.selectAll();
    });
    $("body").on('change', '.select-row', function () {
        medLine.dataGrid.setRowsToDelete();
    });
    $("#deleteColumn").on('click', function(){
        medLine.dataGrid.deleteColumn();
    });
    // Focus the column name field on modal popup
    $("#addColumnModal").on('shown.bs.modal', function(){
        $("#colname").focus();
    });
});