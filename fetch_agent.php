<?php
require_once('../config.php');
require_once('../LIB/DataBase.php');
require_once('../LIB/Functions.php');
$db  = new DataBase();
$rs  = $db->select("SELECT fld_First_Name, fld_Last_Name, fld_User_Name, fld_User_No FROM tbl_user WHERE fld_Suspend=0 AND fld_Access_Level IN (4, 15) AND (fld_Agent_Type IN (1, 2, 0) OR fld_Accounting_Code='009061') AND fld_Hidden=0 AND IF((fld_User_Name LIKE 'D%' OR fld_Access_Level=15), 1, fld_Accounting_Code IS NOT NULL AND fld_Accounting_Code != '')");
$row = $db->Record_Set_Row;
$return             = array();
$message = "";
if(mysql_num_rows($rs) > 0) {
    do {
        $user = new stdClass();
        $user->user_no = $row['fld_User_No'];
        $user->full_name = ($row['fld_First_Name'] != '' ? $row['fld_First_Name'] . ' ' . $row['fld_Last_Name'] : $row['fld_Last_Name']);
        $user->user_name = $row['fld_User_Name'];
        $return[] = $user;
    } while ($row = mysql_fetch_assoc($rs));
}else{
    $message = 'هیج نماینده ای وجود ندارد';
    $return = false;
}
$output = array("result" => (count($return) > 0 ? true : false), 'message' => $message, 'objects' => array('user' => $return));
echo json_encode($output);
