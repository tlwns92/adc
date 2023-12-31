<!DOCTYPE html>
<html>
<head>
    <title>ADC STUDY</title>
    <meta name="keywords" content="" />
    <meta name="description" content="" />
    <base href="/" />
    <meta http-equiv="content-type" content="text/html; charset=utf-8" />
    <link href="http://fonts.googleapis.com/css?family=Abel" rel="stylesheet" type="text/css" />
    <link href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Noto+Sans+KR&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/dropzone/4.3.0/dropzone.css" />
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" />
    <script src="https://code.jquery.com/jquery-2.2.4.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/dropzone/4.3.0/dropzone.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
</head>

<body>
<?php

session_start();

if (!isset($_SESSION['adc_id'])) {
    $randomId = generateRandomId(10);
    $_SESSION['adc_id'] = $randomId;
}

// 랜덤한 ID 생성 함수
function generateRandomId($length) {
    $characters = '0123456789';
    $id = '';
    for ($i = 0; $i < $length; $i++) {
        $id .= $characters[rand(0, strlen($characters) - 1)];
    }
    return $id;
}

    if(isset($_GET['category'])) {
      $category = $_GET['category'];
      $filename = $category . ".php";

      if (file_exists($filename)) {
        include('common/header.php');
        include($filename);
        include('common/sidebar.php');

      } else {
        include('common/header.php');
        include('common/sidebar.php');
        include('error.php');

      }
    } else {
      include('common/header.php');
      include('page/home.php');
      include('common/sidebar.php');
    }

?>
<br><br><br><br>
<?php include('common/footer.php') ?>




  <script src="script.js"></script>

</body>
</html>
