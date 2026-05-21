import os

files = [
    'frontend/src/app/admin/cars/new/page.tsx',
    'frontend/src/app/admin/cars/edit/[id]/page.tsx',
    'frontend/src/app/dashboard/cars/new/page.tsx',
    'frontend/src/app/dashboard/cars/edit/[id]/page.tsx'
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Swap baseSteps
    content = content.replace("{ id: 4, title: 'Address', icon: Navigation },\n    { id: 5, title: 'Pricing', icon: Zap }", "{ id: 4, title: 'Pricing', icon: Zap },\n    { id: 5, title: 'Address', icon: Navigation }")
    content = content.replace("{ id: 4, title: 'Address', icon: Navigation },\r\n    { id: 5, title: 'Pricing', icon: Zap }", "{ id: 4, title: 'Pricing', icon: Zap },\r\n    { id: 5, title: 'Address', icon: Navigation }")

    # 2. Update validateStep
    content = content.replace("if (step === 4) {\n      if (!address)", "if (step === 5) {\n      if (!address)")
    content = content.replace("if (step === 4) {\r\n      if (!address)", "if (step === 5) {\r\n      if (!address)")

    # 3. Update handleSubmit (admin/dashboard new)
    content = content.replace("if (!validateStep(4)) { setCurrentStep(4);", "if (!validateStep(5)) { setCurrentStep(5);")
    content = content.replace("setCurrentStep(5); setShowAllSteps(false);\n      return; \n    }\n\n    setLoading(true);", "setCurrentStep(4); setShowAllSteps(false);\n      return; \n    }\n\n    setLoading(true);")
    content = content.replace("setCurrentStep(5); setShowAllSteps(false);\r\n      return; \r\n    }\r\n\r\n    setLoading(true);", "setCurrentStep(4); setShowAllSteps(false);\r\n      return; \r\n    }\r\n\r\n    setLoading(true);")

    # The handleSubmit pricing validation varies slightly with spacing:
    content = content.replace("setCurrentStep(5); setShowAllSteps(false);\n      return;\n    }", "setCurrentStep(4); setShowAllSteps(false);\n      return;\n    }")
    content = content.replace("setCurrentStep(5); setShowAllSteps(false);\r\n      return;\r\n    }", "setCurrentStep(4); setShowAllSteps(false);\r\n      return;\r\n    }")

    # 4. Extract section blocks and swap them.
    content = content.replace("{(currentStep === 4 || showAllSteps) && (\n       <section id=\"location-module\"", "{(currentStep === 5 || showAllSteps) && (\n       <section id=\"location-module\"")
    content = content.replace("{(currentStep === 4 || showAllSteps) && (\r\n       <section id=\"location-module\"", "{(currentStep === 5 || showAllSteps) && (\r\n       <section id=\"location-module\"")
    
    content = content.replace("{(currentStep === 5 || showAllSteps) && (\n       <section id=\"pricing-module\"", "{(currentStep === 4 || showAllSteps) && (\n       <section id=\"pricing-module\"")
    content = content.replace("{(currentStep === 5 || showAllSteps) && (\r\n       <section id=\"pricing-module\"", "{(currentStep === 4 || showAllSteps) && (\r\n       <section id=\"pricing-module\"")
    
    content = content.replace("{(currentStep === 5 || showAllSteps) && (\n             <section id=\"pricing-module\"", "{(currentStep === 4 || showAllSteps) && (\n             <section id=\"pricing-module\"")
    content = content.replace("{(currentStep === 5 || showAllSteps) && (\r\n             <section id=\"pricing-module\"", "{(currentStep === 4 || showAllSteps) && (\r\n             <section id=\"pricing-module\"")
    
    content = content.replace("{(currentStep === 4 || showAllSteps) && (\n             <section id=\"location-module\"", "{(currentStep === 5 || showAllSteps) && (\n             <section id=\"location-module\"")
    content = content.replace("{(currentStep === 4 || showAllSteps) && (\r\n             <section id=\"location-module\"", "{(currentStep === 5 || showAllSteps) && (\r\n             <section id=\"location-module\"")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
