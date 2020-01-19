<?php

require('../wp-load.php');
$error = null;
session_start();

if(!empty($_POST)) {
	$creds = array();
	$creds['user_login'] = strip_tags(trim($_POST['login']));
	$creds['user_password'] = strip_tags(trim($_POST['password']));
	$user = wp_signon($creds, false);

	if($user->errors) {
		$error = 'Неверный логин или пароль';
	
	} else {
		$_SESSION['user'] = $creds['user_login'];
		header('Location: manager');
		$error = null;
	}
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Document</title>
	<link rel="stylesheet" href="https://bootswatch.com/4/materia/bootstrap.css">
</head>
<body>

	<div class="container">
		<div class="row">
			<div class="col-sm-12">
				<form method="post">
					<fieldset class="mb-2">
						<legend>Вход</legend>
						<div class="form-group">
							<label for="login">Логин</label>
							<input type="text" class="form-control" id="login" name="login" placeholder="Логин">
						</div>
						<div class="form-group">
							<label for="login">Пароль</label>
							<input type="password" class="form-control" id="password" name="password" placeholder="Пароль">
						</div>
						<button type="submit" class="btn btn-primary">Вход</button>
					</fieldset>
					<?php if ($error) { ?>
						<div class="alert alert-dismissible alert-danger">
							<button type="button" class="close" data-dismiss="alert">&times;</button>
							<?php echo $error; ?>
						</div>
					<?php } ?>
				</form>
			</div>
		</div>
	</div>
	
</body>
</html>