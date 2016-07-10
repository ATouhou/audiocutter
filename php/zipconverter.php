<?php
/**
 * Convert folder into Zip Archive Class
 *
 * @category Class
 * @package  PHPClasses
 * @author   Md. Tariqul Islam <tareq@webkutir.net>
 * @license  http://www.gnu.org/copyleft/gpl.html GNU General Public License
 * @link     http://webkutir.net
 */
class zipConverter
{
    private $_isRecursive = false;
    private $_folderList = array();
    private $_zipPath = '';
    private $_zip;

    /**
     * Class Constructor
     */
    function __construct() {
        $this->_zip = new ZipArchive();
    }

    /**
     * Sets Recursive Behaviour in a folder
     * 
     * @param boolean $isRecursive Indicates if folders will be scaned recursively or not
     * 
     * @return void
     */
    function setRecursiveness($isRecursive)
    {
        $this->_isRecursive = $isRecursive;
    }

    /**
     * Adds folder to be included into the Zip Archive
     * 
     * @param array $folderList Array of Folder Paths
     * 
     * @return void
     */
    function addFolder(array $folderList)
    {
        $this->_folderList = array_merge($this->_folderList, $folderList);
    }

    /**
     * Sets Zip file Name with its Path
     * 
     * @param string $path Path of the zip with its name
     * 
     * @return array
     */
    function setZipPath($path)
    {
        if ($this->_zip->open($path, ZipArchive::CREATE)!==TRUE) {
            return array("error"=>true, "msg"=>"Can not open or create <$path>");
        } else {
            $this->_zipPath = $path;
            return array("success"=>true);
        }
    }

    /**
     * Creates Zip Archive from your Provided Folders
     * 
     * @return array
     */
    function createArchive()
    {
        if (count($this->_folderList) == 0) {
            return array("error"=>true, "msg"=>"You did not set Folder(s) which needs to be added into Zip Archive");
        }

        if ($this->_zipPath == '') {
            return array("error"=>true, "msg"=>"Please set Zip Path first before Conversion process.");
        }

        ini_set('memory_limit', '-1');
        foreach ($this->_folderList as $folder) {
            $parent = substr($folder, (strlen(dirname($folder))+1)-strlen($folder));
            if ($parent==$folder) {
                $parent = '';
            } else {
                $this->_zip->addEmptyDir($parent);
            }
            $result = $this->_scanDir($folder, $parent);
            if (is_array($result) && isset($result['error'])) {
                return $result;
            }
        }

        $msg["Num Files"] = $this->_zip->numFiles;

        $this->_zip->close();
        return array("success"=>true, "statistics"=>$msg);
    }

    /**
     * Scans Folder Recursively
     * 
     * @param string $dir       Directory to be Scaned
     * @param string $parentDir Parent Directory
     * 
     * @return array | boolean
     */
    private function _scanDir($dir, $parentDir='')
    {
        $cdir = array_diff(scandir($dir), array('..', '.'));
        foreach ($cdir as $key => $value) {
            if (is_dir($dir . DIRECTORY_SEPARATOR . $value)) {
                if ($this->_isRecursive) {
                    if ($parentDir=='') {
                        $newDir = $value;
                    } else {
                        $newDir = $parentDir. DIRECTORY_SEPARATOR . $value;
                    }
                    if($this->_zip->addEmptyDir($newDir)) {
                        $this->_scanDir($dir . DIRECTORY_SEPARATOR . $value, $newDir);
                    } else {
                        $this->_zip->close();
                        return array(
                            "error"=>true, 
                            "msg"=>"Could not create <$parentDir". DIRECTORY_SEPARATOR . "$value> folder in Zip Archive."
                        );
                    }
                }
            } elseif (is_file($dir . DIRECTORY_SEPARATOR . $value)) {
                if ($parentDir=='') {
                    $newDir = $value;
                    $newName = '';
                } else {
                    $newDir = $dir. DIRECTORY_SEPARATOR . $value;
                    $newName = $parentDir. DIRECTORY_SEPARATOR . $value;
                }
                $result = $this->_zip->addFile($newDir, $newName);
            }
        }

        return true;
    }
}
