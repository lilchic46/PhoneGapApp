var ERROR = 'ERROR';

var db = window.openDatabase('CW3', '1.0', 'CW3', 20000);

$(window).on('orientationchange', onOrientationChange);

function log(message, type = 'INFO') {
    console.log(`${new Date()} [${type}] ${message}`);
}

function onOrientationChange(e) {
    if (e.orientation == 'portrait') {
        log('Portrait.');
    }
    else {
        log('Landscape.');
    }
}

if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
    $(document).on('deviceready', onDeviceReady);
}
else {
    $(document).on('ready', onDeviceReady);
}

function transactionError(tx, error) {
    log(`SQL Error ${error.code}. Message: ${error.message}.`, ERROR);
}

function onDeviceReady() {
    log(`Device is ready.`);

    db.transaction(function (tx) {
        var query = `CREATE TABLE IF NOT EXISTS Property (Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                         PropertyName TEXT NOT NULL UNIQUE,
                                                         PropertyAddress TEXT,
                                                         City TEXT,
                                                         District TEXT,
                                                         Ward TEXT,
                                                         PropertyType TEXT NOT NULL,
                                                         Bedrooms TEXT NOT NULL,
                                                         Date DATE NOT NULL,
                                                         RentPrice INTEGER NOT NULL,
                                                         FurnitureType TEXT,
                                                         Reporter TEXT NOT NULL)`;
        tx.executeSql(query, [], function (tx, result) {
            log(`Create table 'Property' successfully.`);
        }, transactionError);

        // Create table Note.
        var query = `CREATE TABLE IF NOT EXISTS Note (Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                        Note TEXT NOT NULL,
                                                        DateTime DATE NOT NULL,
                                                        PropertyId INTEGER NOT NULL,
                                                        FOREIGN KEY (PropertyId) REFERENCES Property(Id))`;
        tx.executeSql(query, [], function (tx, result) {
            log(`Create table 'Note' successfully.`);
        }, transactionError);
    });

    prepareDatabase(db);
}

//Import data city, district and ward in create form
$(document).on('pagebeforeshow', '#page-create', function(){
    importCity();
    importDistrict();
    importWard(); 
});
$(document).on('change', '#page-create #frm-register #city', function(){
    importDistrict();
    importWard();
});
$(document).on('change', '#page-create #frm-register #district', function(){
    importWard();
});

// Register a new property.
$(document).on('submit', '#page-create #frm-register', confirmProperty);

function importCity(selectedId = -1){
    db.transaction(function (tx) {
        var query = 'SELECT * FROM City ORDER BY Name';
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value='-1'>Select City</option>`;
            for (let item of result.rows){
                if(item.Id == selectedId) {
                    optionList += `<option value='${item.Id}' selected>${item.Name}</option>`
                }
                else {
                    optionList += `<option value='${item.Id}'>${item.Name}</option>`
                }

                // Option 2: -- Dùng cho updated function
                //optionList += `<option value='${item.Id}' ${item.Id == selectedId ? 'selected' : '' }>${item.Name}</option>`;
            }

            $('#page-create #frm-register #city').html(optionList);
            $('#page-create #frm-register #city').selectmenu('refresh', true);
        }
    });
}

function importDistrict(){
    var cityId = $('#page-create #frm-register #city').val();
    
    db.transaction(function (tx) {
        var query = 'SELECT * FROM District WHERE CityId = ? ORDER BY Name';
        tx.executeSql(query, [cityId], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value='-1'>Select District</option>`;
            for (let item of result.rows){
                optionList += `<option value='${item.Id}'>${item.Name}</option>`
            }

            $('#page-create #frm-register #district').html(optionList);
            $('#page-create #frm-register #district').selectmenu('refresh', true);
        }
    });
}

function importWard(){
    var districtId = $('#page-create #frm-register #district').val();
    
    db.transaction(function (tx) {
        var query = 'SELECT * FROM Ward WHERE DistrictId = ? ORDER BY Name';
        tx.executeSql(query, [districtId], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value='-1'>Select Ward</option>`;
            for (let item of result.rows){
                optionList += `<option value='${item.Id}'>${item.Name}</option>`
            }

            $('#page-create #frm-register #ward').html(optionList);
            $('#page-create #frm-register #ward').selectmenu('refresh', true);
        }
    });
}

function confirmProperty(e) {
    e.preventDefault();

    // Get user's input.
    var propertyname = $('#page-create #frm-register #property-name').val();
    var propertyaddress = $('#page-create #frm-register #property-address').val();
    var city = $('#page-create #frm-register #city option:selected').text();
    var district = $('#page-create #frm-register #district option:selected').text();
    var ward = $('#page-create #frm-register #ward option:selected').text();
    var propertytype = $('#page-create #frm-register #property-type').val();
    var bedroom = $('#page-create #frm-register #bedroom').val();
    var rentprice = $('#page-create #frm-register #rent-price').val();
    var furnituretype = $('#page-create #frm-register #furniture-type').val();
    var note = $('#page-create #frm-register #note').val();
    var reporter = $('#page-create #frm-register #reporter').val();
    
    checkProperty(propertyname, propertyaddress, city, district, ward, propertytype, bedroom, rentprice, furnituretype, note, reporter);
   
}

function checkProperty(propertyname, propertyaddress, city, district, ward, propertytype, bedroom, rentprice, furnituretype, note, reporter) {
    db.transaction(function (tx) {
        var query = 'SELECT * FROM Property WHERE PropertyName = ?';
        tx.executeSql(query, [propertyname], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            if (result.rows[0] == null) {
                $('#page-create #error').empty();

                $('#page-create #frm-confirm #property-name').val(propertyname);
                $('#page-create #frm-confirm #property-address').val(propertyaddress);
                $('#page-create #frm-confirm #city').val(city);
                $('#page-create #frm-confirm #district').val(district);
                $('#page-create #frm-confirm #ward').val(ward);
                $('#page-create #frm-confirm #property-type').val(propertytype);
                $('#page-create #frm-confirm #bedroom').val(bedroom);
                $('#page-create #frm-confirm #rent-price').val(rentprice);
                $('#page-create #frm-confirm #furniture-type').val(furnituretype);
                $('#page-create #frm-confirm #note').val(note);
                $('#page-create #frm-confirm #reporter').val(reporter);

                alert("Submit successfully.");
            }
            else {
                var error = 'Property exists.';
                $('#page-create #error').empty().append(error);
                log(error, ERROR);
            }
        }
    });
}