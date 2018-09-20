var canvas = document.querySelector('canvas');
canvas.addEventListener('click', onCanvasClick, false);
var c = canvas.getContext('2d');

//Establish coordinate system (never used again but lets user know the setup)
c.beginPath();
c.moveTo(canvas.width/2,0);
c.lineTo(canvas.width/2,canvas.height);
c.stroke();
c.moveTo(0,canvas.height/2);
c.lineTo(canvas.width,canvas.height/2);
c.stroke();
canvas.width=500;
canvas.height=500;

function onCanvasClick(ev)
{
    var rect = canvas.getBoundingClientRect();
    var x = ev.clientX - rect.left;
    var y = ev.clientY - rect.top;
    var initialChargeData = getUserInput();
    var finalChargeData = drawCharges(initialChargeData);

    if(finalChargeData[3][5] > finalChargeData[3][6])
    {
        x = finalChargeData[3][1] + ((x - finalChargeData[3][4])/finalChargeData[3][0]);
        y = -(((y - finalChargeData[3][3])/finalChargeData[3][0]) - finalChargeData[3][2]);
    }
    else
    {
        x = finalChargeData[3][1] + ((x - finalChargeData[3][3])/finalChargeData[3][0]);
        y = -(((y - finalChargeData[3][4])/finalChargeData[3][0]) - finalChargeData[3][2]);
    }
    console.log(x,y)
    
    var potential = 0;
    var netPotential = 0;
    
    for(var k = 0; k < initialChargeData[0].length; k++)
    {
        if (isNaN(initialChargeData[0][k]))
        {
            break;
        }
        else
        {
            potential = calculatePotential2(initialChargeData[0][k],initialChargeData[4][k],initialChargeData[5][k],x,y);
            netPotential += potential;
        }
    }
    
    document.getElementById("pointpot").value = netPotential+" V";
    
    var netFieldX = 0;
    var netFieldY = 0;
    var coulombsConstant = 8.99;
    for(var k = 0; k < initialChargeData[0].length; k++)
    {
        if (isNaN(initialChargeData[0][k]))
        {
            break;
        }
        else
        {
            var dx = x - (initialChargeData[4][k]);
            var dy = y - (initialChargeData[5][k]);
            var r = Math.pow((Math.pow(dx,2) + Math.pow(dy,2)),.5);
            var fieldMagnitude = initialChargeData[0][k]*coulombsConstant / Math.pow(r,2);
            var theta = Math.abs(Math.atan(dy/dx));
            var fieldX = fieldMagnitude*Math.cos(theta);
            var fieldY = fieldMagnitude*Math.sin(theta);
            
            if(initialChargeData[0][k] > 0)
            {
                if(dx != 0)
                {
                    fieldX = fieldX*(dx/Math.abs(dx));
                }
                if(dy != 0)
                {
                    fieldY = fieldY*(dy/Math.abs(dy));
                }
            }
            else
            {
                if(dx != 0)
                {
                    fieldX = -fieldX*(dx/Math.abs(dx));
                }
                if(dy != 0)
                {
                    fieldY = -fieldY*(dy/Math.abs(dy));
                }
            }
            netFieldX += fieldX;
            netFieldY += fieldY;    
        }
    }
    var netField = Math.pow((Math.pow(netFieldX,2) + Math.pow(netFieldY,2)),.5);
    document.getElementById("pointfield").value = netField+" N/C";
    
    function calculatePotential2(q,qx,qy,x,y)
    {
        var dx = qx - x;
        var dy = qy - y;
        var k = 8.99;
        var r = Math.pow((Math.pow(dx,2) + Math.pow(dy,2)),.5)*k;
        return q/r;
    }
}

function autoGenerate()
{
    var n = 0;
    var x;
    var y;
    var charges = [];
    var xCoords = [];
    var yCoords = [];
    for(var i = 1; i < 13; i++)
    {
        x = Math.round(Math.random()*20);
        y = Math.round(Math.random()*20);
        document.getElementById("x"+i).value = x;
        document.getElementById("y"+i).value = y;
        charges[n] = Math.ceil(Math.random()*300*(Math.pow(-1,Math.round(Math.random()*10))));
        document.getElementById("charge"+i).value = charges[n];
        n += 1;
    }
    var conversionInfo = [];
    
    return[
        charges,
        xCoords,
        yCoords,
        conversionInfo = [],
        ];
}

function electricPotential()
{
    c.clearRect(0, 0, canvas.width, canvas.height);
    var chargeData = getUserInput();
    chargeData = drawCharges(chargeData);
    
    var stride = 5;
    var redValue = 0;
    var blueValue = 0;
    var potential = 0;
    var red;
    var green;
    var blue;
    
    for(var i = 0; i < canvas.width/stride; i++)
    {
        var x = i*stride;
        for(var j = 0; j < canvas.height/stride; j++)
        {
            var y = j*stride;
            for(var k = 0; k < chargeData[0].length; k++)
            {
                if (isNaN(chargeData[0][k]))
                {
                    break;
                }
                else
                {
                    potential = calculatePotential(chargeData[0][k],chargeData[1][k],chargeData[2][k],x,y);
                    if(potential < 0)
                    {
                        blueValue += 20*(Math.abs(potential));
                    }
                    else 
                    {
                        redValue += 20*potential;
                    }
                    console.log(potential);
                }
            }
            red = 255-blueValue;
            blue=255-redValue;
            green=255-redValue-blueValue;
            c.fillStyle = "rgb("+red+","+green+","+blue+")";
            c.fillRect(x ,y , stride, stride);
            redValue = 0;
            blueValue = 0;
        }
    }
    
    for(i = 0; i < chargeData[0].length; i++)
    {
        if(isNaN(chargeData[0][i]))
        {
            break;
        } else
        {
            c.beginPath();
            c.strokeStyle="#FFF";
            c.arc(chargeData[1][i],chargeData[2][i],2,0,2*Math.PI);
            c.stroke();
        }
    }
    
    function calculatePotential(q,qx,qy,x,y)
    {
        var dx = qx - x;
        var dy = qy - y;
        var r = Math.pow((Math.pow(dx,2) + Math.pow(dy,2)),.5);
        return q/r;
    }
    
}

function electricFields()
{
    c.clearRect(0, 0, canvas.width, canvas.height);
    var chargeData = getUserInput();
    chargeData = drawCharges(chargeData);
    
    var dx=0;
    var dy=0;
    var r=0;
    var fieldMagnitude=0;
    var theta=0;
    var fieldX=0;
    var fieldY=0;
    var netFieldX=0;
    var netFieldY=0;
    var netField=0;

    var stride = 10;
    for (var i = 0; i < canvas.width/stride+10; i++)
    {
        var x = stride*i;
        for(var j = 0; j < canvas.height/stride+10; j++)
        {
            var y = stride*j;
            netFieldX = 0;
            netFieldY = 0;
            for(var k = 0; k < chargeData[0].length; k++)
            {
                if (isNaN(chargeData[0][k]))
                {
                    break;
                }
                else
                {
                    dx = x - chargeData[1][k];
                    dy = y - chargeData[2][k];
                    r = Math.pow((Math.pow(dx,2) + Math.pow(dy,2)),.5);
                    fieldMagnitude = chargeData[0][k] / Math.pow(r,2);
                    theta = Math.abs(Math.atan(dy/dx));
                    fieldX = fieldMagnitude*Math.cos(theta);
                    fieldY = fieldMagnitude*Math.sin(theta);
                    
                    if(chargeData[0][k] > 0)
                    {
                        if(dx != 0)
                        {
                            fieldX = fieldX*(dx/Math.abs(dx));
                        }
                        if(dy != 0)
                        {
                            fieldY = fieldY*(dy/Math.abs(dy));
                        }
                    }
                    else
                    {
                        
                        if(dx != 0)
                        {
                            fieldX = fieldX*(dx/Math.abs(dx));
                        }
                        if(dy != 0)
                        {
                            fieldY = fieldY*(dy/Math.abs(dy));
                        }
                    }
                    netFieldX += fieldX;
                    netFieldY += fieldY;    
                }
            }
            netField = Math.pow((Math.pow(netFieldX,2) + Math.pow(netFieldY,2)),.5);
            fieldX = netFieldX/netField;
            fieldY = netFieldY/netField;
            dx = x + (fieldX*stride);
            dy = y + (fieldY*stride);
            drawArrow(x,y,dx,dy);
        }
    }
}

function electricForces()
{
    c.clearRect(0, 0, canvas.width, canvas.height);
    var chargeData = getUserInput();
    chargeData = drawCharges(chargeData);
    
    var x=0;
    var y=0;
    var dx=0;
    var dy=0;
    var r=0;
    var forceMagnitude=0;
    var theta=0;
    var forceX=0;
    var forceY=0;
    var netforceX=0;
    var netforceY=0;
    var netforce=0; 
    var stride = 20;
    var largestForce=0;
    var xforces = [];
    var yforces = [];
    var forces = [];
    
    for(var i = 0; i < chargeData[0].length; i++)
    {
        if (!isNaN(chargeData[0][i]))
        {
            for(var j = 0; j < chargeData[0].length; j++)
            {
                
                if (!isNaN(chargeData[0][j]) && j!=i)
                {
                    x = chargeData[1][i];
                    y = chargeData[2][i];
                    dx = x - chargeData[1][j];
                    dy = y - chargeData[2][j];
                    r = Math.pow((Math.pow(dx,2) + Math.pow(dy,2)),.5);
                    forceMagnitude = chargeData[0][j]*chargeData[0][i]/ Math.pow(r,2);
                    
                    theta = Math.abs(Math.atan(dy/dx));
                    forceX = forceMagnitude*Math.cos(theta);
                    forceY = forceMagnitude*Math.sin(theta);
                    console.log(dx,dy,r,forceMagnitude,theta,forceX,forceY);
                    
                    if(dx != 0)
                    {
                        forceX = forceX*(dx/Math.abs(dx));
                    }
                    if(dy != 0)
                    {
                        forceY = forceY*(dy/Math.abs(dy));
                    }
       
                    netforceX += forceX;
                    netforceY += forceY;    
                }
            }
            netforce = Math.pow((Math.pow(netforceX,2) + Math.pow(netforceY,2)),.5);
            if(netforce > largestForce)
            {
                largestForce = netforce;
            }
            forceX = netforceX/netforce;
            forceY = netforceY/netforce;
            xforces[i] = forceX;
            yforces[i] = forceY;
            forces[i] = netforce;
            netforceX = 0;
            netforceY = 0;
        }
        else
        {
            break;
        }
    }
    for(i = 0; i < chargeData[0].length; i++)
    {
        if (!isNaN(chargeData[0][i]))
        {
            x = chargeData[1][i];
            y = chargeData[2][i];
            dx = x + (xforces[i]*stride*(1+(forces[i]/largestForce)^2));
            dy = y + (yforces[i]*stride*(1+(forces[i]/largestForce)^2));
            drawArrow(x,y,dx,dy);
        }
    }
    
}

function getUserInput()
{
    var n = 0;
    var x;
    var y;
    var charges = [];
    var xCoords = [];
    var yCoords = [];
    var oldCoordsX = [];
    var oldCoordsY = [];
    for(var i = 1; i < 13; i++)
    {
        var q = document.getElementById("charge"+i).value;
        var charge = parseFloat(q);
        if(charge != null)
        {
            x = document.getElementById("x"+i).value;
            y = document.getElementById("y"+i).value;
            xCoords[n] = parseFloat(x);
            yCoords[n] = parseFloat(y);
            oldCoordsX[n] = parseFloat(x);
            oldCoordsY[n] = parseFloat(y);
            charges[n] = charge;
            n += 1;
        }
    }
    var conversionInfo = [];
    
    return[
        charges,
        xCoords,
        yCoords,
        conversionInfo,
        oldCoordsX,
        oldCoordsY,
        ];
}

function drawCharges(chargeData)
{
    // Find conversion factor for meters to pixels
    
    var padding = 80;
    var conversion = 0;
    var dL = 0;
    var maxX = chargeData[1][0];
    var maxY = chargeData[2][0];
    var minX = chargeData[1][0];
    var minY = chargeData[2][0];
    for(var i = 0; i <chargeData[0].length; ++i)
    {
        if(chargeData[1][i] > maxX)
        {
            maxX = chargeData[1][i];
        }else if(chargeData[1][i] < minX)
        {
            minX = chargeData[1][i];
        }
        
        if(chargeData[2][i] > maxY)
        {
            maxY = chargeData[2][i];
        }else if(chargeData[2][i] < minY)
        {
            minY = chargeData[2][i];
        }
    }
    var dx = maxX - minX;
    var dy = maxY - minY;
    
    if (dx != 0 || dy != 0)
    {
        if(dx > dy)
        {
            conversion = (canvas.width - (2*padding))/dx;
            dL = (canvas.height - (dy*conversion))/2;
            for (var i = 0; i < chargeData[0].length; i++)
            {
                if(!isNaN(chargeData[0][i]))
                {
                    chargeData[1][i] = Math.abs(chargeData[1][i]-minX)*conversion + padding;
                    chargeData[2][i] = Math.abs(chargeData[2][i]-maxY)*conversion + dL;
                }
            }
        }
        else
        {
            conversion = (canvas.width - (2*padding))/dy;
            dL = (canvas.width - (dx*conversion))/2;
            for (var i = 0; i < chargeData[0].length; i++)
            {
                if(!isNaN(chargeData[0][i]))
                {
                    chargeData[1][i] = Math.abs(chargeData[1][i]-minX)*conversion + dL;
                    chargeData[2][i] = Math.abs(chargeData[2][i]-maxY)*conversion + padding;
                }
            }
        }
    }
    else
    {
        chargeData[1][0] = canvas.width/2;
        chargeData[2][0] = canvas.height/2;
    }
    
    // Draw circles where charges would be given the conversion for meters to px
    for(i = 0; i < chargeData[0].length; i++)
    {
        if(isNaN(chargeData[0][i]))
        {
            break;
        } else
        {
            c.beginPath();
            c.strokeStyle="#000";
            c.arc(chargeData[1][i],chargeData[2][i],2,0,2*Math.PI);
            c.stroke();
        }
    }
    chargeData[3][0] = conversion;
    chargeData[3][1] = minX;
    chargeData[3][2] = maxY;
    chargeData[3][3] = dL;
    chargeData[3][4] = padding;
    chargeData[3][5] = dx;
    chargeData[3][6] = dy;
    chargeData[3][7] = minY;
    return chargeData;
    
}

function drawArrow(fromx, fromy, tox, toy)
{
    //variables to be used when creating the arrow
    var headlen = 3;

    var angle = Math.atan2(toy-fromy,tox-fromx);

    //starting path of the arrow from the start square to the end square and drawing the stroke
    c.beginPath();
    c.moveTo(fromx, fromy);
    c.lineTo(tox, toy);
    c.strokeStyle = "#cc0000";
    c.lineWidth = 1;
    c.stroke();

    //starting a new path from the head of the arrow to one of the sides of the point
    c.beginPath();
    c.moveTo(tox, toy);
    c.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

    //path from the side point of the arrow, to the other side point
    c.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),toy-headlen*Math.sin(angle+Math.PI/7));

    //path from the side point back to the tip of the arrow, and then again to the opposite side point
    c.lineTo(tox, toy);
    c.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

    //draws the paths created above
    c.strokeStyle = "#cc0000";
    c.lineWidth = 1;
    c.stroke();
    c.fillStyle = "#cc0000";
    c.fill();
}

console.log(canvas);