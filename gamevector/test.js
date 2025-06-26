function f(x)
{
    // we are taking equation as x^3+x-1
    let f = Math.pow(x, 3) + x - 1;
    return f;
}

function secant(x1, x2, E)
{
    let n = 0, xm, x0, c;
    if (f(x1) * f(x2) < 0) {
        do {
            x0 = (x1 * f(x2) - x2 * f(x1)) / (f(x2) - f(x1));

            // check if x0 is root of equation or not
            c = f(x1) * f(x0);

            // update the value of interval
            x1 = x2;
            x2 = x0;

            // update number of iteration
            n++;

            // if x0 is the root of equation then break the loop
            if (c == 0)
                break;
            xm = (x1 * f(x2) - x2 * f(x1)) / (f(x2) - f(x1));
        } while (Math.abs(xm - x0) >= E); // repeat the loop
                                // until the convergence

        console.log("Root of the given equation=" + x0.toFixed(6));
        console.log("No. of iterations = " + n);
    } else {
        console.log("Can not find a root in the given interval");
    }
}

// Driver code
    // initializing the values
    let x1 = 0, x2 = 1, E = 0.0001;
    secant(x1, x2, E);
