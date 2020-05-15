.PHONY: test

test:
	xdg-open "http://localhost:8888"
	jasmine server -c jasmine.yml