<?php
require_once('../config.php');
require_once('../LIB/DataBase.php');
$db				= new DataBase();
$consignmentNo	= $_GET['consignment'];
$rs   			= $db->Select("SELECT fld_Note FROM tbl_receipt_item WHERE fld_Note = $consignmentNo AND fld_Suspend=0");
if(@mysql_num_rows($rs) > 0)
{
		$return_arr = array("exsist" => true);
}else{
		$return_arr = array("exsist" => false);
}
echo json_encode($return_arr);
?>

