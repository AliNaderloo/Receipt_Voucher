<?php
require_once('../config.php');
require_once('../LIB/DataBase.php');
require_once('../LIB/Functions.php');
ini_set('display_errors','off');
error_reporting(-1);
$consignmentNo  = $_REQUEST['id'];
$agent          = $_REQUEST['agent'];
$db             = new DataBase();
$rs             = $db->Select("SELECT fld_Total_Cost, fld_Sender_Code, fld_Sender_No, fld_Receiver_No, fld_Pickup_Man_No, fld_Pickup_Person_No, fld_Delivery_Man_No, fld_Delivery_Person_No, TermsOfPayment,InvValue,fld_Manual_Cost,fld_Lab_Cost,fld_Pack_Cost,fld_Agency_Cost_From,fld_Agency_Cost,fld_Manual_Insurance,fld_Charge_Cost,fld_Manual_VAT FROM tbl_cons WHERE ConsignmentNo = '$consignmentNo' LIMIT 1");
$row            = $db->Record_Set_Row;
if(@mysql_num_rows($rs) > 0)
{
    if($row['fld_Pickup_Man_No'] == $agent || $row['fld_Delivery_Man_No'] == $agent) {
        $customer       = $row['fld_Sender_No'] > 0 && $row['fld_Sender_Code'] != '1000' ? $row['fld_Sender_No'] : ($row['fld_Receiver_No'] > 0 ? $row['fld_Receiver_No'] : 0);
        $cash_contract  = GetTableInfo('tbl_user', 'fld_User_No', $customer, 'fld_Payment_Method') == 2 ? 2 : 1;
        $total_amount = 0;
        if($row['TermsOfPayment'] == 0 && $agent == $row['fld_Pickup_Man_No']){
            $total_amount = $row['fld_Total_Cost'];
        }else if($row['TermsOfPayment'] == 1 && $agent == $row['fld_Delivery_Man_No']){
            $total_amount = ($cash_contract == 2 ? 0 : $row['fld_Total_Cost']) ;
        }else if($row['TermsOfPayment'] == 1 && $agent != $row['fld_Delivery_Man_No']){
            $total_amount = '0';
        }

        if($cash_contract == 1 && $row['fld_Total_Cost'] == 0) {
            $message    = 'بارنامه نقدی فاقد اطلاعات مالی می باشد';
            $return_arr = array("notFound" => true, 'message' => $message);
        }else if($cash_contract == 2 && $row['InvValue'] == 0) {
            $message    = 'بارنامه صورتحسابی بوده و دارای وجه کالای امانی نمیباشد';
            $return_arr = array("notFound" => true, 'message' => $message);
        }else
            $return_arr = array("notFound" => false, "TermsOfPayment" => $row['TermsOfPayment'], "InvValue" => $row['InvValue'], "fld_Total_Cost" => $total_amount);
    }else{
        $message = 'بارنامه با نماینده انتخاب شده مطابقت ندارد';
        $return_arr = array("notFound" => true, 'message' => $message);
    }
}else{
    $message = 'بارنامه ای با این شماره ثبت نشده است';
	$return_arr = array("notFound" => true, 'message' => $message);
}
echo json_encode($return_arr);

?>