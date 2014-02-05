{{ Form::open(array('route' => array('site.invite'), 
			'method' => 'POST', 'class' => 'form-horizontal')) }}
	<div class="form-group">
		{{ Form::label('emails', 'Email addresses (separate lines)', array('class' => 'col-sm-4 control-label' )) }}
		<div class="col-sm-8">
			{{ Form::textarea('emails', '',array('class' => 'form-control')) }}
		</div>
	</div>
	<div class="form-group">
		{{ Form::label('message', 'Message (optional)', array('class' => 'col-sm-4 control-label' )) }}
		<div class="col-sm-8">
			{{ Form::textarea('message', 'I would like to invite you to join this LRS.',array('class' => 'form-control')) }}
		</div>
	</div>
	<div class="form-group">
		{{ Form::label('role', 'Role', array('class' => 'col-sm-4 control-label' )) }}
		<div class="col-sm-8">
			{{ Form::radio('role', 'super') }} Super Admin (can access and do everything) <br />
			{{ Form::radio('role', 'admin') }} Admin (can administer LRSs) <br />
			{{ Form::radio('role', 'observer') }} Observer
		</div>
	</div>
	<hr>
	<div class="col-sm-8 col-sm-offset-4">
		<button type="submit" class="btn btn-primary">Invite</button>
	</div>
{{ Form::close() }}