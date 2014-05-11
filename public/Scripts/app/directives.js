define('app/directives',
    ['angular', 'jquery', 'jqueryui', 'app/configuration', 'app/filters'],
    function(angular, $, jqueryui, configuration, filters) {
        'use strict';

        return angular.module('directives', ['filters'])
            .directive('itcGrid', [
                'dataContext',
                '$filter',
                '$parse',
                '$location',
                function(dc, $filter, parse, $location) {
                    var directive = {
                        restrict: 'A',
                        templateUrl: '/Views/Directives/ITCGrid.html',
                        scope: {
                            customSource: '@',
                            source: '&',
                            rowClass: '@',
                            scopeWrapper: '=',
                            ifEmptyRedirectToCreate: '@',
                            hideDefaultActions: '@'
                        },
                        replace: true,
                        transclude: true,
                        link: function(scope, element, attrs) {

                            scope.columnNames = parse(attrs.columnNames)(scope);
                            scope.columnDescriptions = parse(attrs.columnDescriptions)(scope);
                            scope.customSource = scope.customSource === '1';

                            var customSource = function(data, callback) {
                                scope.source({ filter: data, success: callback });
                            };

                            scope.ifEmptyRedirectToCreate = scope.ifEmptyRedirectToCreate === 'true';
                            var dataSource = !!scope.customSource ? customSource : dc.getPage;

                            scope.gridConfiguration = {
                                currentPage: 1,
                                pages: 1,
                                maxPagesDisplayed: 5,
                                pageSizes: [10, 25, 50],
                                filter: '',
                                pageSize: 10
                            };

                            scope.GetData = function() {
                                dataSource({
                                    page: scope.gridConfiguration.currentPage - 1,
                                    filter: scope.gridConfiguration.filter,
                                    take: scope.gridConfiguration.pageSize
                                }, function(data) {

                                    if (scope.ifEmptyRedirectToCreate && !data.TotalElements && !scope.gridConfiguration.filter && !(scope.gridConfiguration.currentPage - 1)) {
                                        $location.path('/create');
                                    }

                                    scope.GridData = data;
                                    var mod = data.TotalElements % scope.gridConfiguration.pageSize;
                                    scope.gridConfiguration.pages = (mod > 0 ? 1 : 0) + parseInt(data.TotalElements / scope.gridConfiguration.pageSize);
                                });
                            };

                            scope.$watch('gridConfiguration.pageSize', function(newValue, oldValue) {
                                if (oldValue !== newValue) {
                                    scope.GetData();
                                }
                            });
                            scope.$watch('gridConfiguration.currentPage', function(newValue, oldValue) {
                                if (oldValue !== newValue) {
                                    scope.GetData();
                                }
                            });

                            scope.GetData();
                            scope.$on('ITC_GRID', scope.GetData);
                        }
                    };
                    return directive;
                }
            ])
            .directive('itcModal', [
                'dataContext',
                '$timeout',
                '$compile',
                '$rootScope',
                function(dc, timeout, compile, rootScope) {
                    var directive = {
                        restrict: 'A',
                        templateUrl: '/Views/Directives/ITCModal.html',
                        scope: {
                            plural: '@',
                            singular: '@',
                            record: '=',
                            showRemoveModal: '='
                        },
                        replace: true,
                        link: function(scope, element, attrs) {

                            scope.hideModal = function() {
                                scope.record = null;
                                scope.showRemoveModal = false;
                            };

                            scope.confirmRemove = function() {
                                dc.remove({ Id: scope.record.Id }, function() {
                                    rootScope.$broadcast('ITC_GRID', { type: 'ReloadGrid' });
                                    scope.hideModal();
                                });
                            };

                            timeout(function() {
                                element.parent().append('<div class="modal-backdrop in" data-ng-show="showRemoveModal"></div>');
                                compile($('.modal-backdrop'))(scope);
                            }, 0);

                        }
                    };
                    return directive;
                }
            ])
            .directive('dropDown', [
                'dataContext', function(dc) {
                    var directive = {
                        restrict: 'A',
                        replace: true,
                        link: function(scope, element, attrs) {

                            scope.GetList = function() {
                                dc.getList({}, function(data) {
                                    scope.List = data;
                                });
                            };
                        }
                    };
                    return directive;
                }
            ])
            .directive('tabContainer', [
                function() {
                    var directive = {
                        restrict: 'A',
                        link: function(scope, element, attrs) {
                            scope.showTab = function(name) {
                                element.find('.active').removeClass('active');
                                element.find('.' + name).addClass('active');
                                element.find('.tab-content').find('.' + name).addClass('in');
                            };
                        }
                    };
                    return directive;
                }
            ])
            .directive('bootstrapModal', [
                function() {
                    var definitionObject = {
                        restrict: 'A',
                        replace: false,
                        transclude: true,
                        scope: {
                            modalTitle: '@',
                            modalContentType: '@',
                            confirmationButton: '@',
                            confirmationButtonDisabled: '=',
                            cancelButton: '@',
                            cancelButtonDisabled: '=',
                            showModal: '=',
                            modalContentUrl: '=',
                            closeCallback: '&',
                            confirmationCallback: '&',
                            cssClass: '@',
                            state: '='
                        },
                        templateUrl: '/Views/Directives/bootstrapModal.html',
                        link: function(scope, element) {

                            var modal, modalBody, modalBackDrop;

                            var init = function() {
                                scope.state = scope.state || 'default';
                                modal = element.find('.bootstrap-modal');
                                modalBody = modal.find('.modal-body');

                                // add the modal to the html>body element
                                modalBackDrop = element.find('.modal-backdrop');
                                modalBackDrop.appendTo('body');

                                scope.$watch('showModal', function(newValue, oldValue) {
                                    if (newValue) {

                                        // if the content type is iframe, then set a watch to instantiate the iframe
                                        if (scope.modalContentType === 'iframe') {
                                            // if we have to show the modal, then create the content
                                            modalBody.empty();
                                            var iframe = $('<iframe class="frame" height="400" frameborder="0" border="0" src="' + scope.modalContentUrl + '"></iframe>');
                                            modalBody.html(iframe);
                                        }
                                        $('body').addClass('modal-open');
                                        scope.stateClass = 'alert-' + scope.state;
                                    } else {
                                        $('body').removeClass('modal-open');
                                        scope.stateClass = 'alert-default';
                                    }
                                });
                            };

                            scope.confirm = function() {
                                if (angular.isFunction(scope.confirmationCallback)) {
                                    scope.confirmationCallback();
                                }
                            };

                            scope.cancel = function() {
                                scope.showModal = false;

                                if (angular.isFunction(scope.closeCallback)) {
                                    scope.closeCallback();
                                }
                            };

                            var cleanup = function() {
                                modalBackDrop.remove();
                                modal.remove();
                            };

                            scope.$on('$destroy', function() {
                                cleanup();
                            });

                            init();
                        }
                    };
                    return definitionObject;
                }
            ])
            .directive('alertModal', [
                function() {
                    var definitionObject = {
                        restrict: 'A',
                        replace: false,
                        transclude: true,
                        scope: {
                            alertTitle: '@',
                            confirmationButton: '@',
                            cancelButton: '@',
                            showAlert: '=',
                            closeCallback: '&',
                            confirmationCallback: '&'
                        },
                        templateUrl: '/Views/Directives/alertModal.html',
                        link: function(scope, element) {

                            var alert;

                            var init = function() {

                                alert = element.find('.alert');

                                // add the modal to the html>body element
                                alert.appendTo('body');
                                element.find('.modal-backdrop').appendTo('body');
                            };

                            scope.confirm = function() {
                                if (angular.isFunction(scope.confirmationCallback)) {
                                    scope.confirmationCallback();
                                }
                            };

                            scope.cancel = function() {
                                scope.showAlert = false;

                                if (angular.isFunction(scope.closeCallback)) {
                                    scope.closeCallback();
                                }
                            };

                            init();
                        }
                    };
                    return definitionObject;
                }
            ])
            .directive('jqueryDatepicker', function() {
                return {
                    restrict: 'C',
                    require: 'ngModel',
                    scope: {
                        showCallback: '&',
                        date: '=',
                        maxDate: '@',
                        minDate: '@'
                    },
                    link: function(scope, element, attrs, ngModelCtrl) {
                        scope.datePattern = /^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/;
                        scope.maxDate = scope.maxDate || 0;
                        scope.minDate = scope.minDate === '0' ? 0 : scope.minDate || '-100y';

                        $(function() {

                            element.datepicker({
                                showOn: 'both',
                                buttonImageOnly: true,
                                buttonImage: '/Content/images/calendar.gif',
                                changeYear: true,
                                changeMonth: true,
                                yearRange: 'c-100:c+0',
                                maxDate: scope.maxDate,
                                minDate: scope.minDate,
                                defaultDate: new Date(),
                                onClose: function(date, inst) {
                                    ngModelCtrl.$setViewValue(date);
                                    scope.date = new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay);
                                    scope.$apply();
                                }
                            }).datepicker('setDate', new Date());

                            scope.$watch('date', function(newValue, oldValue) {
                                if (oldValue !== newValue && typeof (scope.date) === "string" && !oldValue) {
                                    scope.date = new Date(scope.date);
                                    element.datepicker('setDate', scope.date);
                                    ngModelCtrl.$setViewValue(element.val());
                                }
                                ngModelCtrl.$setValidity('pattern', !!scope.datePattern.test(element.val()));
                            });

                            if (scope.showCallback) {
                                element.next().on('click', function() {
                                    if (angular.isFunction(scope.showCallback)) {
                                        scope.showCallback();
                                    }
                                });
                            }
                        });
                    }
                };
            })
            .directive('itcNumber', [
                function() {
                    var directive = {
                        restrict: 'C',
                        compile: function(element, attrs) {
                            attrs.$set('ngPattern', '/^[1-9][0-9]*$/');
                        }
                    };
                    return directive;
                }
            ])
            .directive('itcEmail', [
                function() {
                    var directive = {
                        restrict: 'C',
                        compile: function(element, attrs) {
                            attrs.$set('ngPattern', '/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/');
                        }
                    };
                    return directive;
                }
            ])
            .directive('itcDecimal', [
                function() {
                    var directive = {
                        restrict: 'C',
                        compile: function (element, attrs) {
                            attrs.$set('ngPattern', '/^[0-9]+((\,)?[0-9]+)?$/');
                        }
                    };
                    return directive;
                }
            ])
            .directive('customerDefuncts', [
                'dataContext',
                '$rootScope',
                '$location',
                function(dc, rootScope, location) {
                    var directive = {
                        restrict: 'A',
                        templateUrl: '/Views/Directives/customerDefuncts.html',
                        scope: {
                            fromCustomer: '@',
                            formValidations: '=',
                            formData: '=',
                            principalCustomerSetted: '='
                        },
                        link: function(scope, element, attrs) {
                            scope.fromCustomer = scope.fromCustomer === 'true';
                            scope.outterScopeWrapper = {};
                            scope.assignData = {};

                            scope.refreshGrids = function() {
                                rootScope.$broadcast('ITC_GRID', { type: 'ReloadGrid' });
                            };

                            scope.getCustomerDefuncts = function(filter, success) {
                                if (scope.fromCustomer) {
                                    filter.customerId = scope.formData && scope.formData.Id || 0;
                                } else {
                                    filter.defunctId = scope.formData && scope.formData.Id || 0;
                                }
                                dc.getCustomerDefuncts(filter, success);
                            };

                            scope.getAssignedCustomerDefuncts = function(filter, success) {
                                if (scope.fromCustomer) {
                                    filter.customerId = scope.formData && scope.formData.Id || 0;
                                } else {
                                    filter.defunctId = scope.formData && scope.formData.Id || 0;
                                }
                                dc.getAssignedCustomerDefuncts(filter, success);
                            };

                            scope.outterScopeWrapper.showDetails = function(record) {
                                var requestData = { Id: scope.fromCustomer ? record.DefunctId : record.CustomerId };

                                var callback = function(data) {
                                    scope.customerDefunctData = data;
                                    scope.showCustomerDefunctDetailsModal = true;
                                };

                                dc.getCustomerDefunctDetail(requestData, callback);
                            };

                            scope.outterScopeWrapper.showAssignModal = function(record) {

                                scope.confirmButtonDisabled = !(scope.formValidations.$valid || scope.formData && scope.formData.Id);
                                scope.outterScopeWrapper.submitted = false;

                                scope.outterScopeWrapper.assignData = {};
                                scope.outterScopeWrapper.assignData.showCheckbox = true;

                                scope.assignData.customerId = scope.fromCustomer ? (scope.formData && scope.formData.Id) || 0 : record.CustomerId;
                                scope.assignData.defunctId = scope.fromCustomer ? record.DefunctId : (scope.formData && scope.formData.Id) || 0;

                                if (!scope.fromCustomer && scope.formData && !scope.formData.Id && !scope.principalCustomerSetted) {
                                    scope.outterScopeWrapper.assignData = {};
                                    scope.outterScopeWrapper.assignData.showCheckbox = false;
                                    scope.outterScopeWrapper.assignData.isPrincipal = true;
                                }

                                scope.showCustomerDefunctAssignModal = true;
                            };

                            scope.assignCustomerToDefunct = function() {
                                scope.outterScopeWrapper.submitted = true;

                                // if customerkinship has entered value
                                if (scope.outterScopeWrapper.assignData && scope.outterScopeWrapper.assignData.customerKinship && scope.outterScopeWrapper.assignData.customerKinship.length) {
                                    scope.assignData.customerKinship = scope.outterScopeWrapper.assignData.customerKinship;
                                    scope.assignData.isPrincipal = scope.outterScopeWrapper.assignData && !!scope.outterScopeWrapper.assignData.isPrincipal;


                                    if (!scope.formData.Id) {
                                        dc.add(scope.formData, function(addData) {

                                            if (scope.fromCustomer) {
                                                scope.assignData.customerId = addData.Id;
                                            } else {
                                                scope.assignData.defunctId = addData.Id;
                                            }

                                            dc.addCustomerDefunct(scope.assignData, function() {
                                                scope.formData.Id = addData.Id;
                                                scope.refreshGrids();
                                                scope.principalCustomerSetted = true;
                                                scope.showCustomerDefunctAssignModal = false;
                                                location.url('edit/' + addData.Id);
                                            });
                                        });
                                    } else {
                                        dc.addCustomerDefunct(scope.assignData, function() {
                                            scope.refreshGrids();
                                            scope.showCustomerDefunctAssignModal = false;
                                        });
                                    }
                                }
                            };

                            scope.outterScopeWrapper.showDeassignModal = function(record) {
                                scope.assignData.customerId = scope.fromCustomer ? (scope.formData && scope.formData.Id) || 0 : record.CustomerId;
                                scope.assignData.defunctId = scope.fromCustomer ? record.DefunctId : (scope.formData && scope.formData.Id) || 0;
                                scope.showCustomerDefunctDeassignModal = true;
                            };

                            scope.deassignCustomerToDefunct = function() {

                                dc.removeCustomerDefunct(scope.assignData, function() {
                                    rootScope.$broadcast('ITC_GRID', { type: 'ReloadGrid' });
                                    scope.showCustomerDefunctDeassignModal = false;
                                }, function() {
                                    scope.showCustomerDefunctDeassignModal = false;
                                });

                            };

                            scope.refreshGrids();
                        }
                    };
                    return directive;
                }
            ])
            .directive('defunctFeatures', [
                'dataContext',
                '$rootScope',
                function(dc, rootScope) {
                    var directive = {
                        restrict: 'A',
                        templateUrl: '/Views/Directives/defunctFeatures.html',
                        scope: {
                            fromDefunct: '@',
                            formData: '=',
                            principalCustomer: '='
                        },
                        link: function(scope, element, attrs) {

                            scope.ctrl = {};
                            var fromDefunct = scope.fromDefunct === '1';
                            scope.ctrl.refreshGrids = function() {
                                rootScope.$broadcast('ITC_GRID', { type: 'ReloadGrid' });
                            };
                            scope.ctrl.getFeatures = function(filter, success) {
                                filter.defunctId = fromDefunct ? (scope.formData && scope.formData.Id || 0) : scope.formData.DefunctId;
                                dc.getFeatures(filter, success);
                            };
                            scope.ctrl.showAssignFeatureModal = function(record) {
                                scope.ctrl.assignFeature = {
                                    submitted: false,
                                    featureId: record.Id,
                                    price: record.Price,
                                    name: record.Name,
                                    quantity: 1
                                };
                                scope.ctrl.assignFeatureModalVisible = true;
                                scope.ctrl.assignFeatureButtonDisabled = fromDefunct ? ((!scope.formData || !scope.formData.Id) && !scope.principalCustomer) : false;
                            };
                            scope.ctrl.assignFeatureModal = function() {
                                scope.ctrl.assignFeature.submitted = true;
                                if (scope.ctrl.assignFeature.quantity && parseInt(scope.ctrl.assignFeature.quantity)) {
                                    var assignFeatureData = {
                                        defunctId: fromDefunct ? scope.formData.Id : scope.formData.DefunctId,
                                        featureId: scope.ctrl.assignFeature.featureId,
                                        quantity: scope.ctrl.assignFeature.quantity
                                    };

                                    dc.addFeatureToDefunct(assignFeatureData, function() {
                                        scope.ctrl.refreshGrids();
                                        scope.ctrl.assignFeatureModalVisible = false;
                                    });
                                }
                            };
                            scope.ctrl.getAssignedFeatures = function(filter, success) {
                                filter.defunctId = fromDefunct ? scope.formData.Id : scope.formData.DefunctId;;
                                dc.getAssignedFeatures(filter, success);
                            };

                            scope.ctrl.showRemoveFeatureModal = function(record) {
                                scope.ctrl.removeFeature = {
                                    defunctId: fromDefunct ? scope.formData.Id : scope.formData.DefunctId,
                                    name: record.Description,
                                    quantity: record.Quantity,
                                    price: record.Price,
                                    subtotal: record.Amount,
                                    detailInvoiceId: record.Id
                                };
                                scope.ctrl.removeFeatureModalVisible = true;
                            };
                            scope.ctrl.removeFeatureModal = function() {
                                var removeData = {
                                    Id: scope.ctrl.removeFeature.detailInvoiceId
                                };
                                dc.removeFeatureFromDefunct(removeData, function() {
                                    scope.ctrl.refreshGrids();
                                    scope.ctrl.removeFeatureModalVisible = false;
                                });
                            };

                            scope.ctrl.refreshGrids();
                        }
                    };
                    return directive;
                }
            ])
            .directive('invoiceEdit', [
                'dataContext',
                '$rootScope',
                function(dc, rootScope) {
                    var directive = {
                        restrict: 'C',
                        link: function(scope, element, attrs) {
                            scope.ctrl = {};
                            scope.ctrl.getFeatures = function(filter, success) {
                                var callback = function(data) {
                                    scope.Features = data.Data;
                                    for (var i = 0; i < data.Data.length; i++) {
                                        var feature = data.Data[i];

                                        for (var j = 0; j < scope.Data.DetailInvoices.length; j++) {
                                            if (feature.Id === scope.Data.DetailInvoices[j].FeatureId) {
                                                feature.IsAssigned = true;
                                            }
                                        }
                                    }
                                    success(data);
                                };

                                dc.getFeatures(filter, callback);
                            };
                            scope.ctrl.addFeature = function(record) {
                                var feature = {
                                    Description: record.Name,
                                    FeatureId: record.Id,
                                    Price: record.Price,
                                    Quantity: 1
                                };
                                record.IsAssigned = true;
                                scope.Data.DetailInvoices.push(feature);
                            };
                            scope.Total = function() {
                                var total = 0;
                                if (scope.Data) {
                                    for (var i = 0; i < scope.Data.DetailInvoices.length; i++) {
                                        total += scope.Data.DetailInvoices[i].Price * scope.Data.DetailInvoices[i].Quantity;
                                    }
                                }
                                return total;
                            };
                            scope.RemoveFeature = function(index) {
                                for (var i = 0; i < scope.Features.length; i++) {
                                    if (scope.Features[i].Id === scope.Data.DetailInvoices[index].FeatureId) {
                                        scope.Features[i].IsAssigned = false;
                                    }
                                }
                                scope.Data.DetailInvoices.splice(index, 1);
                            };
                            scope.ctrl.getAssignedCustomers = function(filter, success) {
                                filter.defunctId = scope.Data.DefunctId;
                                dc.getAssignedCustomers(filter, success);
                            };

                            scope.ctrl.markAsPrincipal = function(customer) {
                                var updateData = {
                                    CustomerId: customer.CustomerId,
                                    DefunctId: customer.DefunctId,
                                    CustomerKinship: customer.CustomerKinship,
                                    IsPrincipal: true
                                };

                                var callback = function() {
                                    scope.Data.CustomerId = customer.CustomerId;
                                    scope.Data.CustomerName = customer.CustomerName;
                                    rootScope.$broadcast('ITC_GRID', { type: 'ReloadGrid' });
                                    scope.ctrl.showCustomerSelector = false;
                                };

                                dc.updateCustomer(updateData, callback);
                            };
                        }
                    };
                    return directive;
                }
            ]);
    }
);

