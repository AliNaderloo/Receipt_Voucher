$(document).ready(function(){
	var rownum=1;
	var sum="";
	var $sender="";
	var $deliver="";
	var $newSender="";
	var $isSenderSet=false;
	var iswarning=false;
	var iserror=false;
	var isValid=false;
	var price={};
	var cod={};
	var $Agent="";
	var $Deliver="";
	var totalPrice=0;
	var totalCod=0;
	var availableAgentTags =  [];
	var availableDeliverTags=[];
	var agentNotExist=false;
	var agentDeliverNotExist=false;
	var $hasError=false;
	var colors = [ 'cadetblue'];
	color = colors[Math.floor(Math.random() * colors.length)];
	String.prototype.toEnDigit = function() {
		return this.replace(/[\u06F0-\u06F9]+/g, function(digit) {
			var ret = '';
			for (var i = 0, len = digit.lejaxngth; i < len; i++) {
				ret += String.fromCharCode(digit.charCodeAt(i) - 1728);
			}
			return ret;
		});
	};

  $('html').css("background-color",color);
  $('#submit').css("background-color",color);
  $.ajax({
    method: "POST",
    url: "fetch_agent.php",
    crossDomain: true,
    dataType: 'json',
    success: function(data){
     $.each(data['objects']['user'], function(key, value)
     {
      if (value['user_name'].substring(0,1)=="D") {
       availableDeliverTags.push({"label" :value['full_name']+" ("+value['user_name']+")","id":value['user_no']});
     }else{
       availableAgentTags.push({"label" :value['full_name']+" ("+value['user_name']+")","id":value['user_no']});
     }

   });
   },
   error: function(data){
   }
 });
  $('input[name="consignment"]').keydown(function (e) {


        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
             // Allow: Ctrl+A, Command+A
             (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) || 
             // Allow: home, end, left, right, down, up
             (e.keyCode >= 35 && e.keyCode <= 40)) {
                 // let it happen, don't do anything
               return;
             }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        	if (!iswarning) {
        		
            $('.toast-container').prepend("<div>تنها عدد مجاز است </div>");
            iswarning=true;
          }
          e.preventDefault();
        }
        if ($('input[name="consignment"]').val().length >= 17) {
        	if (!iserror) {
        		
            $('.toast-container').prepend('<div>بیشتر از ۱۷ رقم وارد کردید</div>');

            iserror=true;
          }
          e.preventDefault();
        }
      });

  var mytable = $('#tblItems').DataTable({
    "pageLength": 80,
    "language": {
     "sEmptyTable":     "هیچ داده ای در جدول وجود ندارد",
     "sInfo":           "نمایش _START_ تا _END_ از _TOTAL_ رکورد",
     "sInfoEmpty":      "نمایش 0 تا 0 از 0 رکورد",
     "sInfoFiltered":   "(فیلتر شده از _MAX_ رکورد)",
     "sInfoPostFix":    "",
     "sInfoThousands":  ",",
     "sLengthMenu":     "نمایش _MENU_ رکورد",
     "sLoadingRecords": "در حال بارگزاری...",
     "sProcessing":     "در حال پردازش...",
     "sSearch":         "جستجو:",
     "sZeroRecords":    "رکوردی با این مشخصات پیدا نشد",
     "oPaginate": {
      "sFirst":    "ابتدا",
      "sLast":     "انتها",
      "sNext":     "بعدی",
      "sPrevious": "قبلی"
    },
    "oAria": {
      "sSortAscending":  ": فعال سازی نمایش به صورت صعودی",
      "sSortDescending": ": فعال سازی نمایش به صورت نزولی"
    }
  },
  "paging": true,
  "lengthChange": false,
  "searching": false,
  "ordering": true,
  "info": true,
  "autoWidth": false,
  "sDom": 'lfrtip'
});

  $('#tblItems').on('click', 'button', function()
  {
    var $btnId = $(this).attr('name');
    $target=$(this).parent().parent();
    delete 	price[$btnId];
    delete  cod[$btnId];
    totalPrice=0;
    totalCod=0;
    $.each(price, function(key, value)
    {
      totalPrice+=parseFloat(value);
    });
    $.each(cod, function(key, value)
    {
      totalCod+=parseFloat(value);
    });
    var comma_separator_number_step = $.animateNumber.numberStepFactories.separator(',');
    $('#totalLivePrice').animateNumber(
    {
      number: totalPrice,
      numberStep: comma_separator_number_step
    }
    );
    $('#totalLiveCod').animateNumber(
    {
      number: totalCod,
      numberStep: comma_separator_number_step
    }
    );
    $('#totalLive').animateNumber(
    {
      number: totalPrice+totalCod,
      numberStep: comma_separator_number_step
    }
    );
    $target.hide('slow', function(){ mytable.row( $target ).remove().draw(); 
     if (mytable.rows().count()==0) {
      mytable.clear().draw();
      $("#agentTags").prop("disabled", false); 
      $("#deliverTags").prop("disabled", false);
      rownum=1;
    }
  });
  });
  $('#submit').click(function(e) { 
    if (!mytable.rows().any()) {

     $('.toast-container').prepend('<div>اطلاعاتی وارد نکردید !');
     $("a[href='modal']").prop("disabled", true); 
     return false;
   }else{

     var consignment=[];
     totalPrice=0;
     totalCod=0;
     var countRows=mytable.rows().count();
     $.each(price, function(key, value)
     {
      totalPrice+=parseFloat(value);
      console.log("key : "+key+" value : "+value);
      consignment.push(key);
    });
     $.each(cod, function(key, value)
     {
      totalCod+=parseFloat(value);
    });
     $('#countRows').text(countRows);
     $("a[href='modal']").prop("disabled", false); 
     var comma_separator_number_step = $.animateNumber.numberStepFactories.separator(',');
     $('#numberTotalPrice').animateNumber(
     {
      number: totalPrice,
      numberStep: comma_separator_number_step
    }
    );
     $('#numberTotalCod').animateNumber(
     {
      number: totalCod,
      numberStep: comma_separator_number_step
    }
    );
     $('#numberTotalCodAndTotal').animateNumber(
     {
      number: totalCod+totalPrice,
      numberStep: comma_separator_number_step
    }
    );
     console.log("Price :"+price);
     console.log("Cons :"+consignment);
     console.log("Price :"+totalPrice);
     console.log("Cod :"+totalCod);
     console.log("Agent :"+$Agent);
     $('#RecordsTR').html("");
     mytable.rows().every( function ( rowIdx, tableLoop, rowLoop ) {
      var data = this.data();
      $('#RecordsTR').html("<tr><td>"+data[0]+"</td>"+data[1]+"<td>"+data[2]+"</td><td>"+data[3]+"</td>+<td>"+data[4]+"</td>+<td>"+data[5]+"</td>+<td>"+data[6]+"</td>+<td>"+data[7]+"</td></tr>");
    });
     totalPrice=0;
     totalCod=0;
     $.each(price, function(key, value)
     {
      totalPrice+=parseFloat(value);
    });
     $.each(cod, function(key, value)
     {
      totalCod+=parseFloat(value);
    });
     $('#sumPrice').html(totalCod+totalPrice);
   }

 });
  $(document).on('confirmation', '#modal', function () {
    var consignment=[];
    totalPrice=0;
    totalCod=0;
    $.each(price, function(key, value)
    {
     totalPrice+=parseFloat(value);
     consignment.push(key);
   });
    $.each(cod, function(key, value)
    {
     totalCod+=parseFloat(value);
   });
    $jsonConsignment=JSON.stringify(consignment);
    console.log($jsonConsignment);
    $.ajax({
     method: "POST",
     url: "receiptApi.php",
     headers: {"APP-AUTH": "aW9zX2N1c3RvbWVyX2FwcDpUUFhAMjAxNg=="},
     data : {
      'consignments' : $jsonConsignment,
      'totalPrice' :totalPrice,
      'totalCod':totalCod,
      'agent':$Agent,
      'driver':$Deliver
    },
    success: function(data){
      data = JSON.parse(data);
      if(data.return) {
        var inst = $('[data-remodal-id=modal1]').remodal();
        inst.open();
        rownum = 1;
        sum = "";
        $sender = "";
        $newSender = "";
        $isSenderSet = false;
        iswarning = false;
        iserror = false;
        isValid = false;
        price = {};
        cod = {};
        totalPrice = 0;
        totalCod = 0;
        agentNotExist = false;
        agentDeliverNotExist = false;
        $('#receipt_no').val(data.receipt_no);
        $('#countRows').text();
        $('#numberTotalPrice').text();
        mytable.clear().draw();
        $("#agentTags").prop("disabled", false); 
        $("#deliverTags").prop("disabled", false); 
        $('input[name=consignment]').focus();
      }else{
        var inst = $('[data-remodal-id=modalfail]').remodal();
        console.log(data.message);
        $("#failMessage").text(data.message);
        inst.open();
      }
    },
    error: function(data){
    }
  });
/*	console.log($jsonConsignment);
	console.log("Price :"+totalPrice);
	console.log("Cod :"+totalCod);
	console.log("Agent :"+$Agent);
	rownum=1;
	mytable.clear().draw();
	$("#tags").removeAttr("disabled");*/
	//alert($Agent);
	//location.reload();
	
});
  $('#reset').click(function(e) {  
    location.reload();
  });
/* var surl =  "http://api.chaparnet.com/fetch_agent?callback=?";
 $.getJSON(surl, function(data){
        $.each(data['objects']['user'], function(key, value){
            availableAgentTags.push({"label" :value['full_name']+" ("+value['user_no']+")","id":value['user_no']});
        });
      });*/


      $( "#agentTags" ).autocomplete({
       source: availableAgentTags,
       select: function(event,ui){
        $(this).val((ui.item ? ui.item.label : ""));
        $Agent=ui.item.id; 
        $('#deliverTags').focus();
        $('#deliverTags').select();
      }
    });
      $( "#deliverTags" ).autocomplete({
       source: availableDeliverTags,
       select: function(event,ui){
        $(this).val((ui.item ? ui.item.label : ""));
        $Deliver=ui.item.id; 
        $('input[name=consignment]').focus();
        $('input[name=consignment]').select();
      }
    });

      $("form").submit(function (e) {
       $("input[name=consignment]").prop("disabled", true);
       e.preventDefault();
       
       agentNotExist=true;
       agentDeliverNotExist=true;
       var isExist=false;
       var $canPass=false;
       e.preventDefault();
       if ( ! mytable.data().count() ) {
        $isSenderSet=false;
        $newSender="";

      }
      var	$id = $('input[name=consignment]').val().toEnDigit();
      if ($id=="") {

       $('.toast-container').prepend('<div>شماره بارنامه را وارد کنید</div>');
       $hasError=true;
     }
     if (!$isSenderSet) {
      $sender=$('#agentTags').val();
      $deliver=$('#deliverTags').val();
    }else{
      $newSender=$('#agentTags').val();
      $deliver=$('#deliverTags').val();
    }
    $isSenderSet=true;
    if ($newSender !="" && $sender != $newSender) {

      $('.toast-container').prepend('<div>نماینده ی جدیدی انتخاب کردید !');
      $hasError=true;
    }
    if ($id.substr(0,7)!=5410000 || $id.substr(14,3)!=101 ){

      $('.toast-container').prepend('<div>فرمت بارنامه درست نیست '+ $id+'</div>');
      $('input[name=consignment]').val("");
      $('input[name=consignment]').focus();
      $hasError=true;       
      isValid=false;
    }else{
      isValid=true;
    }
    $('#tblItems > tbody  > tr').each(function() {
      var tblId =$(this).find("td:eq(1)").text();
      if (tblId ==$id) {

       $('.toast-container').prepend('<div>بارنامه تکراری است ! '+ $id+'</div>');

       $('input[name=consignment]').val("");
       $('input[name=consignment]').focus();
       isExist=true;
       $hasError=true;
     }
   });
    if ($('#agentTags').val()=="") {

      $('#agentTags').select();
      $hasError=true;
    }
    if ($('#deliverTags').val()=="") {

      $('.toast-container').prepend('<div>راننده را مشخص کنید !</div>');
      $('#deliverTags').select();
      $hasError=true;
    }
    $.each(availableDeliverTags, function(key, value)
    {
      if ($('#deliverTags').val()==value['label']) {
       agentDeliverNotExist=false;
     }
   });
    $.each(availableAgentTags, function(key, value)
    {
      if ($('#agentTags').val()==value['label']) {
       agentNotExist=false;
     }
   });

    if (agentNotExist==true) {

      $('.toast-container').prepend('<div>نماینده وجود ندارد !</div>');
      $hasError=true;
    }
    if (agentDeliverNotExist==true) {

      $('.toast-container').prepend('<div>راننده وجود ندارد !</div>');
      $hasError=true;
    }
    if (isValid==true && isExist==false && agentNotExist==false  && agentDeliverNotExist==false &&  $hasError==false ) {
      $.ajax({
       method: "GET",
       url: "checkExsist.php",
       headers: {"APP-AUTH": "aW9zX2N1c3RvbWVyX2FwcDpUUFhAMjAxNg=="},
       dataType: "json",
       contentType: "application/json; charset=utf-8",
       data : {
        'consignment' : $id
      },
      success: function(data){
        if (data.exsist==false) {
         $canPass=true;

       }else{
         $canPass=false;

         $('.toast-container').prepend('<div>این بارنامه قبلا ثبت شده است ! '+ $id+'</div>');

       }
     },
     error: function(data){


     }
   });
    }else{
     $("input[name=consignment]").prop("disabled", false);
     $hasError=false;
   }
   $.when( $.ajax( "checkExsist.php" )).done(function( a1 ) {
    if ($canPass==true) {
     $.ajax({
      type: "GET",
      url: 'api.php',
      data: {
       'id' : $id,
       'agent' : $Agent,
       'driver' : $Deliver
     },
     dataType: "json",
     contentType: "application/json; charset=utf-8",
     success: function (value) {
       if (value.notFound==false) {
        if (value.TermsOfPayment==0) {
         value.TermsOfPayment="پیش کرایه";
       }else{
         value.TermsOfPayment="پس کرایه";
       }
       value.consignment=$id;
       mytable.row.add([rownum,value.consignment,value.TermsOfPayment,$sender,$deliver,number_format(value.InvValue, 0, '.', ','),number_format(value.fld_Total_Cost, 0, '.', ','),(number_format(parseFloat(value.fld_Total_Cost)+parseFloat(value.InvValue), 0, '.', ',')),"<button name="+'"'+$id+'"'+"class="+'"'+"button"+'"'+">حذف</button>"]);
       mytable.order([ 0, 'desc']).draw();
       rownum++;
       myObj = {
         "name":"John",
         "age":30,
         "cars":[ "Ford", "BMW", "Fiat" ]
       };
       price[$id] = value.fld_Total_Cost;
       cod[$id]=value.InvValue;
       totalPrice=0;
       totalCod=0;
       $.each(price, function(key, value)
       {
        totalPrice+=parseFloat(value);
      });
       $.each(cod, function(key, value)
       {
        totalCod+=parseFloat(value);
      });
       var comma_separator_number_step = $.animateNumber.numberStepFactories.separator(',');
       $('#totalLivePrice').animateNumber(
       {
        number: totalPrice,
        numberStep: comma_separator_number_step
      }
      );
       $('#totalLiveCod').animateNumber(
       {
        number: totalCod,
        numberStep: comma_separator_number_step
      }
      );
       $('#totalLive').animateNumber(
       {
        number: totalPrice+totalCod,
        numberStep: comma_separator_number_step
      }
      );
       $("#agentTags").prop("disabled", true);
       $("#deliverTags").prop("disabled", true);
       $('input[name=consignment]').val("");
       $('input[name=consignment]').focus();
     }else{

      $('.toast-container').prepend('<div>'+value.message+ $id+'</div>');
      $('input[name=consignment]').val("");
      $('input[name=consignment]').focus();

    }},
    fail: function (result) { alert('Fail'); 
  }
});
   }
 });
   $.when( $.ajax( "api.php" )).done(function( a1 ) {
     $hasError=false;
     $("input[name=consignment]").prop("disabled", false);
   });
 });
function number_format(number, decimals, decPoint, thousandsSep) {
	number = (number + '').replace(/[^0-9+\-Ee.]/g, '')
	var n = !isFinite(+number) ? 0 : +number
	var prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
	var sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep
	var dec = (typeof decPoint === 'undefined') ? '.' : decPoint
	var s = ''
	var toFixedFix = function (n, prec) {
		var k = Math.pow(10, prec)
		return '' + (Math.round(n * k) / k)
		.toFixed(prec)
	}
    // @todo: for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.')
    if (s[0].length > 3) {
    	s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
    }
    if ((s[1] || '').length < prec) {
    	s[1] = s[1] || ''
    	s[1] += new Array(prec - s[1].length + 1).join('0')
    }
    return s.join(dec)
  }
});

