<?	
session_start();
header('Content-type: application/json');

// upload file

if (is_uploaded_file($_FILES['file']['tmp_name'])) {
		
	$folder = session_id().'_'.time();
	mkdir("../audio/".$folder, 0777);
	$path = "../audio/".$folder.'/'.$_FILES['file']['name'];
	move_uploaded_file($_FILES['file']['tmp_name'], $path);
	
	$json = array(
		'path' => $path, 
		'error' => false,
	);
} else {
	
	$json = array(
		'path' => '', 
		'error' => true,
	);		
}
echo json_encode($json);
?>