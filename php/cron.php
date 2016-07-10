<?
// delete 24 hours old files
$root = "../audio";
$dir = scandir($root);
for ($i=2; $i < count($dir); $i++) {
	$created_time = substr($dir[$i], strrpos($dir[$i], '_')+1, strlen($dir[$i])-1); 
	$yesterday = time() - 60*60*24;
	// find old projects (24h)
	if($yesterday < $created_time) {
		// 1-st level directory	
		$level_1 = scandir($root.'/'.$dir[$i]);
		for ($i1=2; $i1 < count($level_1); $i1++) {
			if(strpos($level_1[$i1],".") !== false) {
				// file
				unlink($root.'/'.$dir[$i].'/'.$level_1[$i1]);
			} else {
				// folder
				// 2-nd level directory
				$level_2 = scandir($root.'/'.$dir[$i].'/'.$level_1[$i1]);
				for ($i2=2; $i2 < count($level_1); $i2++) {
					unlink($root.'/'.$dir[$i].'/'.$level_1[$i1].'/'.$level_2[$i2]);	
				}
				rmdir($root.'/'.$dir[$i].'/'.$level_1[$i1]);				
			}
		}
		rmdir($root.'/'.$dir[$i]);	
	}	
}	

