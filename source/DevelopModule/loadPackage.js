/*
This file is part of developjs. It is subject to the licence terms in the COPYRIGHT file found in the top-level directory of this distribution and at https://raw.githubusercontent.com/KisanHub/developjs/master/COPYRIGHT. No part of developjs, including this file, may be copied, modified, propagated, or distributed except according to the terms contained in the COPYRIGHT file.
Copyright © 2015 The developers of developjs. See the COPYRIGHT file in the top-level directory of this distribution and at https://raw.githubusercontent.com/KisanHub/developjs/master/COPYRIGHT.
*/


var alreadyLoadedPackage = {}

module.loadPackage = function loadPackage(path, packageName, callbackOnPackageLoaded)
{
	if (alreadyLoadedPackage.hasOwnProperty(packageName))
	{
		if (callbackOnPackageLoaded instanceof Function)
		{
			callbackOnPackageLoaded()
		}
		return
	}
	alreadyLoadedPackage[packageName] = true
	
	var ajax = new XMLHttpRequest()
	ajax.onload = function(event)
	{
		if (ajax.status != 200)
		{
			throw "Could not load package '" + packageName + "'"
		}
		
		var topLevelModules
		try
		{
			topLevelModules = JSON.parse(ajax.responseText)
		}
		catch(e)
		{
			if (e instanceof SyntaxError)
			{
				console.error("Could not parse JSON ('" + e.message + "'): '" + ajax.responseText + "'")
			}
			throw e
		}
		
		var outstanding = topLevelModules.length
		topLevelModules.forEach(function(topLevelModule)
		{
			module.loadModule(path, topLevelModule, function moduleLoaded()
			{
				outstanding -= 1
				if (outstanding == 0)
				{
					if (callbackOnPackageLoaded instanceof Function)
					{
						callbackOnPackageLoaded()
					}
				}
			})
		})
	}
	
	ajax.open('GET', path + packageName + '.package.json', true)
	ajax.send()
}
