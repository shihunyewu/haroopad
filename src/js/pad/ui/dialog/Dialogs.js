define([
		'keyboard',
		'ui/file/File.opt',
		'ui/dialog/Save',
		'ui/dialog/Shortcuts',
		'ui/dialog/Posts'
	], 
	function(HotKey, FileOpt, Save, Shortcuts, Posts) {
		var dialogs;

		var SaveDialog = new Save,
				ShortcutsDialog = new Shortcuts,
				PostsDialog = new Posts;

		HotKey('shift-ctrl-space', function() {
			dialogs.shortcuts.show();
		});
		HotKey('cmd-shift-t', PostsDialog.show.bind(PostsDialog));

		window.ee.on('file.posts.tumblr', PostsDialog.show.bind(PostsDialog));
		PostsDialog.bind('post', function(to, from, password, remember) {
			window.parent.ee.emit('posts.tumblr', FileOpt.toJSON(), {
				to: to, 
				from: from, 
				password: password, 
				remember: remember
			});
		});

		window.ee.on('posted.tumblr', PostsDialog.hide.bind(PostsDialog));

		return dialogs = {
			save: SaveDialog,
			shortcuts: ShortcutsDialog,
			posts: PostsDialog
		}
});