<?	
$json = array();
header('Content-type: application/json');
require_once '../php/class.mp3.php';

$path = $_REQUEST['path'];
$name = $_REQUEST['name'];
$pattern = '/..\/audio\/(\w+)\/(\w+).mp3/i';
$replacement = '../audio/$1/'.$name.'.mp3';
$output = preg_replace($pattern, $replacement, $path);

$error = false;

try {
	$mp3 = new mp3;
	$mp3->get_mp3($path, true, false);
	$mp3->set_mp3($path, $output, array(), array());
	$mp3->cut_mp3($path, $output, $_REQUEST['start'], $_REQUEST['end'], 'second', false);
} catch (Exception $ex) {
	$error = 'An error has occurred: ' . $ex->getMessage();	
	$output = false;	
}
if (!file_exists($output)) {
	$error = 'An error has occurred: the file has not been generated';
	$output = false;
} else {
	$output = '../php/download.php?path='.$output;
}

$json['error'] = $error;
$json['output'] = $output;


echo json_encode($json);