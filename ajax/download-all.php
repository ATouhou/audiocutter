<?	
$json = array();
header('Content-type: application/json');
require_once '../php/class.mp3.php';
require_once '../php/zipconverter.php';

$path = $_REQUEST['path'];
$regions = json_decode($_REQUEST['regions']);
$error = '';


if (sizeof($regions) > 0) {

	// archive dir name
	$pattern = '/..\/audio\/(\w+)\/(\w+).mp3/i';
	$archive_dir = preg_replace($pattern, '../audio/$1/$2_archive', $path);
	$root_dir = preg_replace($pattern, '../audio/$1', $path);
	$archive_name = preg_replace($pattern, '$2_archive', $path);
	// delete archive directory if it exists
	if(file_exists($archive_dir)) {
		$folder_scan = scandir($archive_dir);
		for ($i=2; $i < count($folder_scan); $i++) {
			unlink($archive_dir.'/'.$folder_scan[$i]);	
		}
		rmdir($archive_dir);
	}

	// create new archive directory
	if(file_exists($root_dir)) {
		mkdir($archive_dir, 0777);
		// create tracks
		foreach ($regions as $region) {
			$output = $archive_dir.'/'.$region->name.'.mp3';
			try {
				$mp3 = new mp3;
				$mp3->get_mp3($path, true, false);
				$mp3->set_mp3($path, $output, array(), array());
				$mp3->cut_mp3($path, $output, $region->time_start, $region->time_end, 'second', false);
			} catch (Exception $ex) {
				$error = 'An error has occurred: ' . $ex->getMessage();	
				$output = false;	
			}		
		}
		// create archive
		$zip = new zipConverter();
		$zip->setRecursiveness(true); 
		$zip->addFolder(array($archive_dir));
		$zip->setZipPath($archive_dir.'/'.$archive_name.'.zip'); 
		$result = $zip->createArchive();
		if(!$rezult->success) {
			$error = 'Unable to create archive';
		} else {
			$output = '../php/download.php?path='.$archive_dir.'/'.$archive_name.'.zip';
		}
	}
	
	$json['error'] = $error;
	$json['output'] = $output;
	
}
echo json_encode($json);