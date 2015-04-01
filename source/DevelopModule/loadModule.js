/*
This file is part of developjs. It is subject to the licence terms in the COPYRIGHT file found in the top-level directory of this distribution and at https://raw.githubusercontent.com/KisanHub/developjs/master/COPYRIGHT. No part of developjs, including this file, may be copied, modified, propagated, or distributed except according to the terms contained in the COPYRIGHT file.
Copyright © 2015 The developers of developjs. See the COPYRIGHT file in the top-level directory of this distribution and at https://raw.githubusercontent.com/KisanHub/developjs/master/COPYRIGHT.
*/


var alreadyLoadedModule = {}

module.loadModule = function loadModule(path, moduleName, callbackOnAllScriptsLoaded)
{
	if (alreadyLoadedModule.hasOwnProperty(moduleName))
	{
		if (callbackOnAllScriptsLoaded instanceof Function)
		{
			callbackOnAllScriptsLoaded()
		}
		return
	}
	alreadyLoadedModule[moduleName] = true
	
	var scriptUrl = path + moduleName + '.js'
	var ajax = new XMLHttpRequest()
	ajax.onload = function(event)
	{
		if (ajax.status != 200)
		{
			loadModuleUsingJsonListOfModuleFiles(path, moduleName, callbackOnAllScriptsLoaded)
			return
		}
		
		var scriptNode = newScriptNode(scriptUrl)
		scriptNode.textContent = ajax.responseText
		
		var headNode = getHeadNode()
		headNode.appendChild(scriptNode)
	}
	
	ajax.open('GET', scriptUrl, true)
	ajax.send()
}

function loadModuleUsingJsonListOfModuleFiles(path, moduleName, callbackOnAllScriptsLoaded)
{
	var ajax = new XMLHttpRequest()
	ajax.onload = function(event)
	{
		if (ajax.status != 200)
		{
			throw "Could not load module '" + moduleName + "'"
		}
		
		var modules
		try
		{
			modules = JSON.parse(ajax.responseText)
		}
		catch(e)
		{
			if (e instanceof SyntaxError)
			{
				console.error("Could not parse JSON ('" + e.message + "'): '" + ajax.responseText + "'")
			}
			throw e
		}
		loadModulesFromRoot(path, modules, callbackOnAllScriptsLoaded)
	}
	
	ajax.open('GET', path + moduleName + '/module.json', true)
	ajax.send()
}

function loadModulesFromRoot(path, modules, callbackOnAllScriptsLoaded)
{
	var scriptNodes = []
	
	scriptNodes.path = path
	
	scriptNodes.callbackOnAllScriptsLoaded = callbackOnAllScriptsLoaded
	
	scriptNodes.remainingToDownload = -1
	
	scriptNodes.loadScript = function loadScript(ourNamespace, fileName)
	{
		var scriptUrl = scriptNodes.path + ourNamespace.join('/') + '/' + fileName + '.js'
		
		var scriptNode = newScriptNode(scriptUrl)
	
		var ajax = new XMLHttpRequest()
		scriptNode.ajax = ajax
		ajax.open('GET', scriptUrl, true)
		ajax.onload = function(event)
		{
			if (ajax.status != 200)
			{
				throw "Could not load script from URL " + scriptNode.title
				return false
			}
			
			scriptNode.wrapScriptInModule(ourNamespace, this.responseText)
			scriptNodes.anotherScriptDownloaded()
		}
		
		scriptNode.download = function download()
		{
			ajax.send()
		}
		
		scriptNode.wrapScriptInModule = function wrapScriptInModule(ourNamespace, originalScript)
		{
			// eg MongoModule.Credentials
			var globalObject = ourNamespace.join('.')
			
			var descendentNamespace = ourNamespace[ourNamespace.length - 1]

			/*		
				MongoModule.Credentials = (function(module){
					<originalScript>
					return module
				}(MongoModule.Credentials || {}));
	
				where globalObject == MongoModule.Credentials, say
			*/
	
			var script = ''
	
			// top
			var script = script + '// ' + scriptUrl + '\n\n'
			var script = script + '"use strict";\n'
			var script = script + globalObject + ' = (function(module){\n'
	
			// middle
			var script = script + originalScript + '\n'
	
			// bottom
			var script = script + 'return module\n'
			var script = script + '}(' + globalObject + ' || {}));\n'
	
			this.textContent = script
		}
		
		this.push(scriptNode)
	}
	
	scriptNodes.anotherScriptDownloaded = function anotherScriptDownloaded()
	{
		this.remainingToDownload -= 1

		if (this.remainingToDownload == 0)
		{
			var headNode = getHeadNode()
		
			this.forEach(function(orderedScriptNode, index)
			{
				headNode.appendChild(orderedScriptNode)
				delete this[index]
			})

			if (this.callbackOnAllScriptsLoaded instanceof Function)
			{
				this.callbackOnAllScriptsLoaded()
			}
		}
	}
	
	scriptNodes.download = function download()
	{
		this.remainingToDownload = this.length
	
		this.forEach(function(scriptNode)
		{
			scriptNode.download()
		})
	}
			
	scriptNodes.loadModulesRecursively = function loadModulesRecursively(parentNamespace, modules)
	{
		for (var moduleName in modules)
		{
			if (!modules.hasOwnProperty(moduleName))
			{
				continue
			}
			
			var ourNamespace = parentNamespace.slice()
			ourNamespace.push(moduleName)
			
			var parentModule = window
			ourNamespace.forEach(function(childModuleName)
			{
				/*
					For index 0, equivalent of:-
			
					var MongoModule = (function(module)
					{
						return module
					})(MongoModule || {}));
				*/
				/*
					For other indices, equivalent of:-
			
					MongoModule.Credentials = (function(module)
					{
						return module
					})(MongoModule.Credentials || {});
				*/
				if (parentModule[childModuleName])
				{
					return
				}
				parentModule[childModuleName] = (function(childModuleName)
				{
					return childModuleName
				})(parentModule[childModuleName] || {});
			
				parentModule = parentModule[childModuleName]
			})
			
			var filesOrSubmodules = modules[moduleName]
			var length = filesOrSubmodules.length
			for (var index = 0; index < length; index++)
			{
				var fileOrSubmodule = filesOrSubmodules[index]
				if (typeof fileOrSubmodule == 'object')
				{
					this.loadModulesRecursively(ourNamespace, fileOrSubmodule)
				}
				else
				{
					this.loadScript(ourNamespace, fileOrSubmodule)
				}
			}	
		}
	}
	
	scriptNodes.loadModulesRecursively([], modules)
	
	scriptNodes.download()
}

function newScriptNode(scriptUrl)
{
	var scriptNode = document.createElement('script')
	scriptNode.type = 'text/javascript'
	scriptNode.async = false
	scriptNode.title = scriptUrl
	//scriptNode.src = scriptUrl
	return scriptNode
}

function getHeadNode()
{
	return document.getElementsByTagName('head')[0]
}
