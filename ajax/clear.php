<?	
$json = array();
header('Content-type: application/json');

// clear and delete directory with current files

preg_match_all('/audio\/(.*)\//U', $_REQUEST['path'], $out);
$dir = '../audio/'.$out[1][0]; 
// 1-st level directory
if(file_exists($dir)) {
	$level_1 = scandir($dir); 
	for ($i1=2; $i1 < count($level_1); $i1++) {
		if(strpos($level_1[$i1],".") !== false) {
			// file
			unlink($dir.'/'.$level_1[$i1]);
		} else {
			// directory
			// 2-nd level directory
			$level_2 = scandir($dir.'/'.$level_1[$i1]);
			for ($i2=2; $i2 < count($level_1); $i2++) {
				unlink($dir.'/'.$level_1[$i1].'/'.$level_2[$i2]);	
			}
			rmdir($dir.'/'.$level_1[$i1]);				
		}
	}
	rmdir($dir);
}
