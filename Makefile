################################################################################
# 
# The Makefile For Building Lilium
# 
# @author Jack
# @version 1.0
# @date Thu Jun 25 18:44:08 2015
#
# Tasks:
# 	- clean: Clean the build
# 	- compile: Compile the source code
# 	- compile_test: Compile the test source code
# 	- test: Run the test using jasmine (yes, you must have jasmine installed)
# 	- build: Same as compile
#   - all: Same as compile compile_test then test, this is the default one
#
################################################################################

#===============================================================================
#
# Functions
#
#===============================================================================

rwildcard=$(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2) $(filter $(subst *,%,$2),$d))

#===============================================================================
#
# Variables
#
#===============================================================================

ifdef DEBUG
	SILENT := 
else
	SILENT := '@'
endif

BABEL := babel
SPEC_DIR := spec
ECHO := echo
RM := rm -rf
CP := cp
CD := cd
MKDIR := mkdir -p
JASMINE := jasmine
DIST_DIR := dist

#===============================================================================
#
# Files
#
#===============================================================================
CORE_DIR := src/core
SHAPES_DIR := src/shapes
CORE_FILES_PATTERN := src/core/*.jsx
CORE_FILES := $(wildcard $(CORE_FILES_PATTERN))
SHAPES_FILES_PATTERN := src/shapes/*.jsx
SHAPES_FILES := $(wildcard $(SHAPES_FILES_PATTERN))
ROOT_FILES_PATTERN := src/*.jsx
ROOT_FILES := $(wildcard $(ROOT_FILES_PATTERN))
TEST_FILES := $(call rwildcard, tests, *.jsx)
TEST_DIST_FILES := $(foreach f, $(TEST_FILES:jsx=js), $(SPEC_DIR)/$(f))
TEST_MAP_FILES := $(foreach f, $(TEST_FILES:jsx=js.map), $(SPEC_DIR)/$(f))

#===============================================================================
#
# Patterns
#
#===============================================================================

$(SPEC_DIR)/%_spec.js.map : %_spec.jsx
	$(SILENT) $(BABEL) -d $(SPEC_DIR) -s $@ $<

#===============================================================================
#
# Tasks
#
#===============================================================================

all: build test

build: compile

whiteboard.js: $(CORE_FILES) $(SHAPES_FILES) $(ROOT_FILES)
	$(SILENT) $(BABEL) -o whiteboard.js -s whiteboard.js.map $(CORE_FILES) $(SHAPES_FILES) $(ROOT_FILES)

compile: whiteboard.js test

clean: 
	@$(ECHO) "Cleaning..."
	$(SILENT) $(RM) $(SPEC_DIR)/*.js $(SPEC_DIR)/*.map $(SPEC_DIR)/tests whiteboard.js*
	@$(ECHO) "Done."

test: compile $(TEST_MAP_FILES)
	@$(JASMINE)

.PHONY: all clean test compile build dist
