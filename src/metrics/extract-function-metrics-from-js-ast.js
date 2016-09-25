/**
 * Given a JavaScript AST, returns its metrics.
 */
module.exports = function (jsAST) {
    if (Array.isArray(jsAST)) {
        return visitArrayOfPrograms(jsAST);
    }
    return visitProgram(jsAST);
};

function visitArrayOfPrograms(arrayOfAstProgramNodes) {
    let metrics = arrayOfAstProgramNodes.map(astProgramNode => visitProgram(astProgramNode));
    return [].concat.apply([], metrics);
}

function visitProgram(programNode) {
    let bodyNodes = programNode.body;
    return bodyNodes.map(bodyNode => Visitors.visitStatement(bodyNode));
}

class Utils {

    static clearEmptyProperties(obj) {
        Object.keys(obj).forEach(key => {
            if (!obj[key]) {
                delete obj[key];
            }
        });
        return obj;
    }
}

/*
 Number of declaration statements (Decl.) ------------------------ DONE
 Number of executable statements (Stmt.) ------------------------- TODO
 Number of conditional statements (Cond.) ------------------------ TODO
 Number of looping statements (Loop) ----------------------------- TODO
 Maximum nesting level of control constructs (Nest) -------------- TODO
 Number of return statements (Ret.) ------------------------------ TODO
 Number of parameters (Param.) ----------------------------------- DONE
 Number of called functions (Call) ------------------------------- TODO
 */
class Metrics {
    constructor({
        declarationStmtCount = 0, executableStmtCount = 0, conditionalStmtCount = 0, loopingStmtCount = 0,
        maxNestingLevelOfControlConstructs = 0, returnStmtCount = 0, parametersCount = 0, callExpressionCount = 0
    } = {}) {
        if (declarationStmtCount) this.declarationStmtCount = declarationStmtCount;
        if (executableStmtCount) this.executableStmtCount = executableStmtCount;
        if (conditionalStmtCount) this.conditionalStmtCount = conditionalStmtCount;
        if (loopingStmtCount) this.loopingStmtCount = loopingStmtCount;
        if (maxNestingLevelOfControlConstructs) this.maxNestingLevelOfControlConstructs = maxNestingLevelOfControlConstructs;
        if (returnStmtCount) this.returnStmtCount = returnStmtCount;
        if (parametersCount) this.parametersCount = parametersCount;
        if (callExpressionCount) this.callExpressionCount = callExpressionCount;
    }

    addMetrics(otherMetrics) {
        this.add('declarationStmtCount', otherMetrics);
        this.add('executableStmtCount', otherMetrics);
        this.add('conditionalStmtCount', otherMetrics);
        this.add('loopingStmtCount', otherMetrics);
        this.add('maxNestingLevelOfControlConstructs', otherMetrics);
        this.add('returnStmtCount', otherMetrics);
        this.add('parametersCount', otherMetrics);
        this.add('callExpressionCount', otherMetrics);
    }

    add(propName, otherMetrics) {
        if (otherMetrics && otherMetrics[propName]) {
            this[propName] = (this[propName] || 0) + otherMetrics[propName];
        }
    }
}

class Visitors {
    static visit(astNode, visitors) {
        const visitorFunction = visitors[astNode.type];
        if (!visitorFunction) {
            throw new Error("Couldn't find visitor for type: " + astNode.type);//+"\n\nNode: "+JSON.stringify(astNode, null, 4));
        }
        return visitorFunction(astNode);
    }

    static visitStatement(astNode) {
        return Visitors.visit(astNode, this.statementVisitors);
    }

    static extractDetailsAndAddMetricsFromStatement(statements, metrics) {
        const statementsDetails = statements.map(statement => Visitors.visitStatement(statement));
        statementsDetails.forEach(stmtDetail => metrics.addMetrics(stmtDetail.metrics));
        return statementsDetails;
    }

    static extractDetailsAndAddMetricsForOptional(statements, metrics) {
        if (!statements) {
            return false;
        }
        return this.extractDetailsAndAddMetricsFromStatement(statements, metrics);
    }

    static extractDetailsAndAddMetricsForOptionalSingle(stmt, metrics) {
        if (!stmt) {
            return false;
        }
        return this.extractDetailsAndAddMetricsFromStatement([stmt], metrics);
    }
}
Visitors.statementVisitors = {
    FunctionDeclaration: visitFunctionDeclaration,
    ForStatement: visitForStatement,
    IfStatement: visitIfStatement,
    SwitchStatement: visitSwitchStatement,
    ReturnStatement: visitReturnStatement,

    // expressions:
    BinaryExpression: visitBinaryExpression,
    UpdateExpression: visitUpdateExpression,

    ExpressionStatement: visitExpressionStatement,
    VariableDeclaration: visitVariableDeclaration,
    VariableDeclarator: visitVariableDeclarator,

    CallExpression: visitCallExpression,
    Literal: visitLiteral
};

function visitFunctionDeclaration(functionDeclarationNode) {
    const functionMetrics = new Metrics({parametersCount: functionDeclarationNode.params.length});
    const blockDetail = visitBlockStatement(functionDeclarationNode.body);
    functionMetrics.addMetrics(blockDetail.metrics);
    return {
        _type: 'FunctionDeclaration',
        functionName: functionDeclarationNode.id.name,
        metrics: functionMetrics,
        detail: blockDetail
    };
}

function visitBlockStatement(blockStatementNode) {
    const blockMetrics = new Metrics();
    return {
        _type: 'BlockStatement',
        metrics: blockMetrics,
        detail: Visitors.extractDetailsAndAddMetricsFromStatement(blockStatementNode.body, blockMetrics)
    };
}

function visitExpressionStatement(expressionStatementNode) {
    const expressionMetrics = new Metrics();
    return {
        _type: 'ExpressionStatement',
        metrics: expressionMetrics,
        detail: Visitors.extractDetailsAndAddMetricsFromStatement([expressionStatementNode.expression], expressionMetrics)
    };
}

function visitCallExpression(callExpressionNode) {
    console.log("###########################################");
    console.log("###########################################");
    console.log("###########################################");
    console.log(JSON.stringify(callExpressionNode, null, 4));
    const callExpressionMetrics = new Metrics({callExpressionCount: 1});
    return {
        _type: 'CallExpression',
        metrics: callExpressionMetrics,
        detail: Visitors.extractDetailsAndAddMetricsForOptional(callExpressionNode.arguments, callExpressionMetrics)
    };
}

function visitAssignmentExpression(assignmentExpressionNode) {
    return {
        _type: 'AssignmentExpression',
    };
}

function visitLiteral(literalNode) {
    return {
        _type: 'Literal'
    };
}

function visitVariableDeclaration(variableDeclarationNode) {
    const variableDeclarationMetrics = new Metrics();
    return {
        _type: 'VariableDeclaration',
        metrics: variableDeclarationMetrics,
        declarations: Visitors.extractDetailsAndAddMetricsFromStatement(variableDeclarationNode.declarations, variableDeclarationMetrics)
    };
}

function visitVariableDeclarator(variableDeclaratorNode) {
    const variableDeclaratorMetrics = new Metrics({declarationStmtCount: 1});
    return {
        _type: 'VariableDeclarator',
        variableName: variableDeclaratorNode.id.name,
        metrics: variableDeclaratorMetrics,
        detail: Utils.clearEmptyProperties(
            {init: Visitors.extractDetailsAndAddMetricsForOptionalSingle(variableDeclaratorNode.init, variableDeclaratorMetrics)}
        )
    };
}

function visitForStatement(forStatementNode) {
    const forMetrics = new Metrics();
    return {
        _type: 'ForStatement',
        metrics: forMetrics,
        detail: {
            init: Visitors.extractDetailsAndAddMetricsFromStatement([forStatementNode.init], forMetrics),
            test: Visitors.extractDetailsAndAddMetricsFromStatement([forStatementNode.test], forMetrics),
            update: Visitors.extractDetailsAndAddMetricsFromStatement([forStatementNode.update], forMetrics),
            body: Visitors.extractDetailsAndAddMetricsFromStatement(forStatementNode.body.body, forMetrics),
        }
    };
}

function visitIfStatement() {
    return {
        _type: 'IfStatement'
    };
}

function visitSwitchStatement() {
    return {
        _type: 'SwitchStatement'
    };
}

function visitReturnStatement() {
    return {
        _type: 'ReturnStatement'
    };
}

function visitBinaryExpression() {
    return {
        _type: 'BinaryExpression'
    };
}

function visitUpdateExpression() {
    return {
        _type: 'UpdateExpression'
    };
}

