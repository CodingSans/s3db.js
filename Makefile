#!make

MAKE_VERSION := $(shell $(MAKE) --version)
ifneq ($(firstword $(MAKE_VERSION)),GNU)
$(error Use GNU Make)
endif

default: test

.PHONY: test
test:
	docker-compose -f docker-compose.test.yml build
	docker-compose -f docker-compose.test.yml run test

