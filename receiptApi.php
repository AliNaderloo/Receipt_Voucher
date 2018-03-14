<?php
require_once('../config.php');
require_once('../LIB/DataBase.php');
require_once('../LIB/DataBaseLog.php');
require_once('../LIB/class.log.php');
require_once('../LIB/Functions.php');
$consignmentsNo = json_decode($_REQUEST['consignments']);
$agent			= $_REQUEST['agent'];
$driver			= $_REQUEST['driver'];
$db   	= new DataBase();
$rs   	= $db->Select("SELECT fld_Note FROM tbl_receipt_item WHERE fld_Note IN (".implode(',',$consignmentsNo).")");
$row	= $db->Record_Set_Row;
$exist 	= array();
$return = false;
$item_insert = array();
if(@mysql_num_rows($rs) > 0)
{
	do{
		$exist[] = $row['fld_Note'];
	}while($row = mysql_fetch_assoc($rs));
	$message 	= 'بارنامه '.implode(',', $exist).'  قبلا رسید شده است';
	$return 	= false;
}
if($agent == 3748 || $agent == 4609){
    $selected_agent = $driver;
    $cash_flow		= 25;
}else{
    $selected_agent = $agent;
    $cash_flow		= 23;
}
$dl_code 		=  GetTableInfo('tbl_user', 'fld_User_No', $selected_agent, 'fld_Accounting_Code');
if (count($exist) <= 0) {
	$insert = $db->Insert('tbl_receipt', array('fld_Cash_Id' =>  3, 'fld_Branch_Id' => 1,  'fld_User_No' => $selected_agent, 'fld_DL_Code' => $dl_code, 'fld_Date' => date('Y-m-d H:i:s'), 'fld_At' => setAt()));
	if ($insert) {
		foreach($consignmentsNo as $consignment){
			$row_cons		= Return_Table_Detail('tbl_cons', 'fld_Suspend', 0, 'fld_Total_Cost,InvValue,fld_Delivery_Man_No,fld_Pickup_Man_No,TermsOfPayment,fld_Sender_No,fld_Receiver_No,fld_Cons_No', $rs, 'ConsignmentNo="'.$consignment.'"');
			$cons_no 		= $row_cons['fld_Cons_No'];
			$sender_no 		= $row_cons['fld_Sender_No'];
			$receiver_no 	= $row_cons['fld_Receiver_No'];
            $sender_no		= $sender_no > 0 ? $sender_no : $receiver_no;
            $cash_contract 	= GetTableInfo('tbl_user', 'fld_User_No', $sender_no, 'fld_Payment_Method');
            //$total			= ($cash_contract == 0 || $cash_contract == 1) ? GetTableInfo('tbl_cons', 'fld_Cons_No', $cons_no, 'SUM(fld_Total_Cost)') : 0;
            $total = 0;
            if($row_cons['TermsOfPayment'] == 0 && $agent == $row_cons['fld_Pickup_Man_No']){
                $total = $row_cons['fld_Total_Cost'];
            }else if($row_cons['TermsOfPayment'] == 1 && $agent == $row_cons['fld_Delivery_Man_No']){
                $total = $cash_contract == 2 ? 0 : $row_cons['fld_Total_Cost'];
            }else if($row_cons['TermsOfPayment'] == 1 && $agent != $row_cons['fld_Delivery_Man_No']){
                $total = '0';
            }

			$InvValue		= $row_cons['InvValue'];
			if($total > 0 || $InvValue > 0)
				$item_insert[] 	= $db->Insert('tbl_receipt_item', array('fld_Receipt_No' => $insert, 'fld_Accounting_Operation_Id' => 3, 'fld_Cash_Flow_Factor_Id' => $cash_flow, 'fld_Cash_Amount' => Null2Zero($total), 'fld_COD_Amount' => Null2Zero($InvValue), 'fld_DL_Code' => $dl_code, 'fld_Cons_No' => $cons_no, 'fld_Note' => $consignment, 'fld_At' => setAt()));
		}
		$return 	= true;
		$message	= 'کلیه بارنامه ها با موفقیت ذخیره شده';
	} else {
        $return 	= false;
        $message	= 'هیچیک از بارنامه ها ذخیره نشده';
	}
}
echo json_encode(array('return' => $return, 'message' => $message, 'receipt_no' => $insert));

?>

